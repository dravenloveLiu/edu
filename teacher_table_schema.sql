-- 讲师表结构 SQL 脚本
-- 数据库：教育管理系统

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS edu_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE edu_system;

-- 删除表（如果存在）
DROP TABLE IF EXISTS edu_teacher;

-- 创建讲师表
CREATE TABLE edu_teacher (
    id VARCHAR(19) NOT NULL COMMENT '讲师ID',
    name VARCHAR(20) NOT NULL COMMENT '讲师姓名',
    intro VARCHAR(500) NOT NULL DEFAULT '' COMMENT '讲师简介',
    career VARCHAR(500) DEFAULT '' COMMENT '讲师资历',
    level INT(10) UNSIGNED NOT NULL COMMENT '头衔 1高级讲师 2首席讲师',
    avatar VARCHAR(255) DEFAULT '' COMMENT '讲师头像',
    sort INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序',
    is_deleted TINYINT(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除 1（true）已删除， 0（false）未删除',
    gmt_create DATETIME NOT NULL COMMENT '创建时间',
    gmt_modified DATETIME NOT NULL COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_name (name),
    KEY idx_level (level),
    KEY idx_sort (sort),
    KEY idx_is_deleted (is_deleted),
    KEY idx_gmt_create (gmt_create)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='讲师表';

-- 创建索引
CREATE INDEX idx_name_level ON edu_teacher(name, level);
CREATE INDEX idx_sort_deleted ON edu_teacher(sort, is_deleted);

-- 显示表结构
DESCRIBE edu_teacher;

-- 显示创建表的SQL
SHOW CREATE TABLE edu_teacher;
