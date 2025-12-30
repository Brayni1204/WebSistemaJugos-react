/*
  Warnings:

  - You are about to drop the `compra` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `detallecompra` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `compra` DROP FOREIGN KEY `Compra_proveedorId_fkey`;

-- DropForeignKey
ALTER TABLE `compra` DROP FOREIGN KEY `Compra_tenantId_fkey`;

-- DropForeignKey
ALTER TABLE `detallecompra` DROP FOREIGN KEY `DetalleCompra_compraId_fkey`;

-- DropForeignKey
ALTER TABLE `detallecompra` DROP FOREIGN KEY `DetalleCompra_productoId_fkey`;

-- DropTable
DROP TABLE `compra`;

-- DropTable
DROP TABLE `detallecompra`;

-- CreateTable
CREATE TABLE `Gasto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `total_amount` DECIMAL(65, 30) NOT NULL,
    `proveedorId` INTEGER NULL,
    `tenantId` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DetalleGasto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `purchase_price` DECIMAL(65, 30) NOT NULL,
    `gastoId` INTEGER NOT NULL,
    `productoId` INTEGER NULL,

    UNIQUE INDEX `DetalleGasto_gastoId_productoId_key`(`gastoId`, `productoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `Proveedor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetalleGasto` ADD CONSTRAINT `DetalleGasto_gastoId_fkey` FOREIGN KEY (`gastoId`) REFERENCES `Gasto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetalleGasto` ADD CONSTRAINT `DetalleGasto_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `Producto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
