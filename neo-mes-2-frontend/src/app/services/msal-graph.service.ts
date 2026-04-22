import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo, AuthenticationResult, RedirectRequest } from '@azure/msal-browser';
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GraphUserInfo {
  displayName: string;
  mail: string | null;
  userPrincipalName?: string;
  jobTitle: string | null;
  department: string | null;
  id: string;
}

export interface SecurityGroup {
  id: string;
  displayName: string;
  '@odata.type': string;
}

@Injectable({ providedIn: 'root' })
export class MsalGraphService {
  private readonly msalService = inject(MsalService);
  private readonly http = inject(HttpClient);

  private userLoadedSubject = new BehaviorSubject<AccountInfo | null>(null);
  private profilePictureSubject = new BehaviorSubject<string>('');
  private userDataSubject = new BehaviorSubject<GraphUserInfo | null>(null);
  private userSecurityGroupsSubject = new BehaviorSubject<SecurityGroup[]>([]);

  public userLoaded$ = this.userLoadedSubject.asObservable();
  public profilePicture$ = this.profilePictureSubject.asObservable();
  public userData$ = this.userDataSubject.asObservable();
  public userSecurityGroups$ = this.userSecurityGroupsSubject.asObservable();

  get userLoaded(): AccountInfo | null {
    return this.userLoadedSubject.value;
  }
  get profilePicture(): string {
    return this.profilePictureSubject.value;
  }
  get userData(): GraphUserInfo | null {
    return this.userDataSubject.value;
  }
  get userSecurityGroups(): SecurityGroup[] {
    return this.userSecurityGroupsSubject.value;
  }

  setActiveAccountAndLoadData(): void {
    let activeAccount = this.msalService.instance.getActiveAccount();
    if (!activeAccount && this.msalService.instance.getAllAccounts().length > 0) {
      this.msalService.instance.setActiveAccount(this.msalService.instance.getAllAccounts()[0]);
      activeAccount = this.msalService.instance.getActiveAccount();
    }
    if (activeAccount) {
      this.userLoadedSubject.next(activeAccount);
      this.loadUserData(activeAccount);
      this.loadProfilePicture(activeAccount);
      this.loadSecurityGroups(activeAccount);
    } else {
      this.userLoadedSubject.next(null);
      this.login();
    }
  }

  loadSecurityGroups(account?: AccountInfo): void {
    const targetAccount = account || this.msalService.instance.getActiveAccount();
    if (!targetAccount) return;
    this.getAccessToken(['https://graph.microsoft.com/GroupMember.Read.All'])
      .pipe(
        switchMap((token) => {
          if (!token) throw new Error('No token available for Graph API');
          return this.http.get<{ value: any[] }>('https://graph.microsoft.com/v1.0/me/memberOf', {
            headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
          });
        }),
        map((res) => res.value),
        catchError((err) => {
          console.error('Error loading security groups:', err);
          return of([]);
        }),
      )
      .subscribe((groups) => this.userSecurityGroupsSubject.next(groups));
  }

  public isMemberOf(groupId: string): Observable<boolean> {
    return this.userSecurityGroups$.pipe(
      filter((g) => g.length > 0),
      take(1),
      map((groups) => groups.some((group) => group.id === groupId)),
    );
  }

  getAccessToken(scopes?: string[]): Observable<string> {
    const activeAccount = this.msalService.instance.getActiveAccount();
    if (!activeAccount) return of('');
    const request = {
      scopes: scopes || [environment.customScope],
      account: activeAccount,
    };
    return of(undefined).pipe(
      switchMap(() => this.msalService.acquireTokenSilent(request)),
      catchError(() => this.msalService.acquireTokenPopup(request)),
      map((res: AuthenticationResult) => res.accessToken),
      catchError(() => of('')),
    );
  }

  login(): void {
    this.msalService.loginRedirect({
      prompt: 'select_account',
    } as RedirectRequest);
  }

  logout(): void {
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: environment.MSAL_postLogoutRedirectUri,
    });
  }

  loadUserData(account?: AccountInfo): void {
    const targetAccount = account || this.msalService.instance.getActiveAccount();
    if (!targetAccount) return;
    this.getAccessToken(['https://graph.microsoft.com/User.Read'])
      .pipe(
        switchMap((token) => {
          if (!token) throw new Error('No token available');
          return this.http.get<GraphUserInfo>('https://graph.microsoft.com/v1.0/me', {
            headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
          });
        }),
        catchError((error): Observable<GraphUserInfo> => {
          console.error('Error loading user data:', error);
          return of<GraphUserInfo>({
            displayName: targetAccount.name ?? '',
            mail: targetAccount.username,
            jobTitle: null,
            department: null,
            id: targetAccount.localAccountId,
          });
        }),
      )
      .subscribe((userData) => this.userDataSubject.next(userData));
  }

  loadProfilePicture(account?: AccountInfo): void {
    const targetAccount = account || this.msalService.instance.getActiveAccount();
    if (!targetAccount) return;
    this.getAccessToken(['https://graph.microsoft.com/User.Read'])
      .pipe(
        switchMap((token) => {
          if (!token) throw new Error('No token available');
          return this.http.get('https://graph.microsoft.com/v1.0/me/photo/$value', {
            headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
            responseType: 'blob',
          });
        }),
        switchMap((blob) => this.convertBlobToBase64(blob)),
        catchError(() => of(this.createInitialsAvatar(targetAccount))),
      )
      .subscribe((base64Picture) => this.profilePictureSubject.next(base64Picture));
  }

  getProfilePicture(): Observable<string> {
    if (!this.profilePictureSubject.value && this.userLoaded) this.loadProfilePicture();
    return this.profilePicture$;
  }

  getUserData(): Observable<GraphUserInfo | null> {
    if (!this.userDataSubject.value && this.userLoaded) this.loadUserData();
    return this.userData$;
  }

  getUserProperty<K extends keyof GraphUserInfo>(
    property: K,
  ): Observable<GraphUserInfo[K] | undefined> {
    return this.userData$.pipe(map((d) => d?.[property]));
  }

  refreshUserData(): void {
    const account = this.msalService.instance.getActiveAccount();
    if (account) {
      this.loadUserData(account);
      this.loadProfilePicture(account);
    }
  }

  clearUserData(): void {
    this.userLoadedSubject.next(null);
    this.profilePictureSubject.next('');
    this.userDataSubject.next(null);
  }

  private convertBlobToBase64(blob: Blob): Observable<string> {
    return new Observable<string>((observer) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        observer.next(reader.result as string);
        observer.complete();
      };
      reader.onerror = (error) => observer.error(error);
      reader.readAsDataURL(blob);
      return () => reader.abort();
    });
  }

  private createInitialsAvatar(account: AccountInfo): string {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const size = 100;
    canvas.width = size;
    canvas.height = size;
    if (context && account.name) {
      const initials = account.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      let hash = 0;
      for (let i = 0; i < account.name.length; i++)
        hash = account.name.charCodeAt(i) + ((hash << 5) - hash);
      const color = '#' + (hash & 0x00ffffff).toString(16).padStart(6, '0');
      context.fillStyle = color;
      context.fillRect(0, 0, size, size);
      context.fillStyle = '#ffffff';
      context.font = 'bold 40px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(initials, size / 2, size / 2);
      return canvas.toDataURL();
    }
    return 'assets/default-avatar.png';
  }

  isAuthenticated(): boolean {
    return this.msalService.instance.getAllAccounts().length > 0;
  }

  getActiveAccount(): AccountInfo | null {
    return this.msalService.instance.getActiveAccount();
  }

  getAllAccounts(): AccountInfo[] {
    return this.msalService.instance.getAllAccounts();
  }
}
