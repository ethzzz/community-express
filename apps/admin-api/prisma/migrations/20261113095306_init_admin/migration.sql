-- CreateTable
CREATE TABLE `reports` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `target_type` VARCHAR(32) NOT NULL,
    `target_id` BIGINT NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `status` ENUM('pending', 'resolved', 'rejected') NOT NULL DEFAULT 'pending',
    `handled_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `reports_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `moderation_records` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `target_type` VARCHAR(32) NOT NULL,
    `target_id` BIGINT NOT NULL,
    `action` VARCHAR(32) NOT NULL,
    `operator_id` BIGINT NOT NULL,
    `reason` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `moderation_records_target_type_target_id_idx`(`target_type`, `target_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `processed_events` (
    `event_id` VARCHAR(64) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`event_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
