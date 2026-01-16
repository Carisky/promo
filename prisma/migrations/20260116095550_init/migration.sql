-- CreateTable
CREATE TABLE `ServiceRequest` (
    `id` VARCHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(24) NOT NULL DEFAULT 'new',
    `name` VARCHAR(80) NULL,
    `model` VARCHAR(120) NOT NULL,
    `serviceSlug` VARCHAR(80) NULL,
    `issue` TEXT NOT NULL,
    `comment` TEXT NULL,
    `email` VARCHAR(120) NULL,
    `phone` VARCHAR(60) NULL,
    `telegram` VARCHAR(80) NULL,
    `contact` VARCHAR(240) NOT NULL,
    `preferredContact` VARCHAR(24) NULL,
    `urgency` VARCHAR(24) NULL,

    INDEX `ServiceRequest_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
