# safe-undo-migrations.ps1
# Скрипт безопасного отката миграций Sequelize (.cjs)

# Массив миграций в правильном порядке отката (от зависимых к независимым)
$migrations = @(
    "20251224-update-articles-container.cjs",
    "20251220-create-article-versions.cjs",
    "20251218-create-comments.cjs",
    "20251216-create-articles.cjs",
    "20251211-create-workspaces.cjs"
)

foreach ($migration in $migrations) {
    Write-Host "Проверяем миграцию: $migration"

    # Получаем список выполненных миграций из таблицы SequelizeMeta
    $executed = npx sequelize-cli db:migrate:status --env development | Select-String $migration

    if ($executed -and $executed.ToString() -match 'up') {
        Write-Host "Откатываем миграцию: $migration"
        npx sequelize-cli db:migrate:undo --name $migration

        if ($LASTEXITCODE -ne 0) {
            Write-Host "Ошибка при откате $migration. Скрипт прерван." -ForegroundColor Red
            break
        }

        Start-Sleep -Seconds 1
    } else {
        Write-Host "Миграция $migration не выполнялась или уже откатана. Пропускаем."
    }
}

Write-Host "Откат миграций завершён."
