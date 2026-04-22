-- CreateTable
CREATE TABLE "OpcuaNode" (
    "id" SERIAL NOT NULL,
    "connection" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "field" TEXT NOT NULL,
    "browsePath" TEXT NOT NULL,
    "rootNodeId" TEXT NOT NULL,
    "resolvedId" TEXT,
    "unit" TEXT,
    "label" TEXT,

    CONSTRAINT "OpcuaNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Silo" (
    "id" SERIAL NOT NULL,
    "nummer" INTEGER NOT NULL,
    "bezeichnung" TEXT,
    "standort" TEXT,
    "materialId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Silo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" SERIAL NOT NULL,
    "artikelnummer" TEXT NOT NULL,
    "bezeichnung" TEXT,
    "typ" TEXT,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OpcuaNode_connection_group_index_field_key" ON "OpcuaNode"("connection", "group", "index", "field");

-- CreateIndex
CREATE UNIQUE INDEX "Silo_nummer_key" ON "Silo"("nummer");

-- CreateIndex
CREATE UNIQUE INDEX "Material_artikelnummer_key" ON "Material"("artikelnummer");

-- AddForeignKey
ALTER TABLE "Silo" ADD CONSTRAINT "Silo_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE SET NULL ON UPDATE CASCADE;
