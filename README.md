# Привет шаблонизатор Pug(Jade)

Содержимое и описание будет дополняться

## Стартовый шаблон

<table><thead>
<tr>
<th>Команда</th>
<th>Результат</th>
</tr>
</thead><tbody>
<tr>
<td width="22%"><code>npm i</code></td>
<td>Установить зависимости</td>
</tr>
<tr>
<td><code>gulp-watch.bat</code></td>
<td>Запустить сборку, сервер и слежение за файлами</td>
</tr>
<tr>
<td><code>clearcache.bat</code></td>
<td>Очитка кэша</td>
</tr>
<tr>
<td><code>smart-grid.bat</code></td>
<td>Генерирует примеси адаптивной сетки на flex (настройки сетки в <code>gulpfile.js</code>) кидает в папку <code>./less/global</code></td>
</tr>
<tr>
<td><code>build.bat</code></td>
<td>Сборка проекта (минифицированый вид, как результат работы)</td>
</tr>
<tr>
<td><code>sprite.bat</code></td>
<td>Сборка спрайта <code>.img/icons</code></td>
</tr>
<tr>
<td><code>svg-sprite.bat</code></td>
<td>Сборка svg - спрайта <code>.img/svg</code></td>
</tr>
</tbody></table>

## Парадигма

- Используется именование классов, файлов и переменных по БЭМ.

- svg спрайт подтягивается в localStorage и инжектися в документ ( при последующих загрузках спрайт тянется из localStorage )
  если localStorag не поддерживается - спрайт подтягивается с хоста

## Назначение папок

```bash
build/          # - Сюда собирается финальный проект проект.
src/            # - Исходные файлы
  includes/     # - фрагменты html для includa в основной файл  
  css/          # - глобальные css-файлы (будут скопированы только если существует и не пустые)
  fonts/        # - шрифты проекта (будут скопированы в папку сборки, подпапку fonts/)
  img/          # - глобальные картинки (будут обработаны(опимизированы))
      /content  # - контентные изображения
      /icons    # - иконки(для сшивки в спрайт)
      /svg      # - svg иконки(для сшивки в спрайт)
  js/           # - main.js-файла), фреймворки
  less/         # - диспетчер подключений и глобальные стили
      blocks/   # - блоки для импорта в style.less
      global/   # - файлы scaffolding, variables, fonts
  index.html    # - главная страница проекта
```