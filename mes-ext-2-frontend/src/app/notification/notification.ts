import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { NotificationStore } from "../store/notification/notification.store";

@Component({
  selector: "app-notification",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./notification.html",
  styleUrl: "./notification.css",
})
export class NotificationComponent {
  protected notificationStore = inject(NotificationStore);

  close(id: string) {
    this.notificationStore.removeNotification(id);
  }
}
