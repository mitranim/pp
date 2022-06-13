import * as u from './util.mjs'

export default [
  {
    id: 1,
    slug: `whatispoi`,
    title: `Что такое пои`,
    authorId: null,
    authorName: `Илья Атис`,
    photographerName: `Илья Атис`,
    snippet: `Пои — это шарики на цепях. Крутить пои полезно для развития ловкости и координации движений. Кроме этого с пои можно выступать и устраивать яркие представления со световыми или огненным реквизитом (крутить огонь).`,
    content: Deno.readTextFileSync(`templates/articles/whatispoi.md`),
    isDraft: false,
    image: `/images/spinning-red.jpg`,
    createdAt: null,
  },
  {
    id: 2,
    slug: `history`,
    title: `История пои`,
    authorId: null,
    authorName: `Илья Атис`,
    photographerName: ``,
    snippet: `Пои появились в Новой Зеландии. Во второй половине XX века кручение пои (поинг) стало увлекательным хобби среди молодежи. Появились пойстеры  и фаерщики. Пойстеры — любители крутить пои. Фаерщики — артисты огненного жанра.`,
    content: Deno.readTextFileSync(`templates/articles/history.md`),
    isDraft: false,
    image: `/images/maori-aotearoa.jpg`,
    createdAt: null,
  },
  {
    id: 3,
    slug: `choose-poi`,
    title: `Как подобрать пои`,
    authorId: null,
    authorName: `Илья Атис`,
    photographerName: `Marie Zag`,
    snippet: `Подобрать или купить пои можно в специальных магазинах для пойстеров. Также любой может сделать пои самостоятельно, прочитав несколько статей.`,
    content: Deno.readTextFileSync(`templates/articles/choose-poi.md`),
    isDraft: false,
    image: `/images/colourful-balls-left.jpg`,
    createdAt: null,
  },
  {
    id: 4,
    slug: `find`,
    title: `Найдите внутренний ресурс`,
    authorId: null,
    authorName: `Илья Атис`,
    photographerName: `Severin`,
    snippet: `Научиться крутить пои можно если смотреть видео уроки поинга в Интернете или посещать занятия с преподавателем.`,
    content: Deno.readTextFileSync(`templates/articles/find.md`),
    isDraft: false,
    image: `/images/bask-in-sunlight.jpg`,
    createdAt: null,
  },
  {
    id: 5,
    slug: `poi-folk-tale`,
    title: `Пои былина`,
    authorId: null,
    authorName: `Илья Атис`,
    photographerName: `Alexei Vitvitskiy`,
    snippet: `Поинг — это целый мир новых движений! Чтобы его было легко и интересно осваивать важно разобраться в основных понятиях.`,
    content: Deno.readTextFileSync(`templates/articles/poi-folk-tale.md`),
    isDraft: false,
    image: `/images/recons.jpg`,
    createdAt: `2015-09-21T20:45:27.000Z`,
  },
  {
    id: 6,
    slug: `elros-advice`,
    title: `Как крутить пои красиво и качественно`,
    authorId: 3,
    authorName: ``,
    photographerName: `Коля У`,
    snippet: `Чтобы крутить пои красиво и качественно читайте советы и наставления настоящих мастеров поинга..`,
    content: Deno.readTextFileSync(`templates/articles/elros-advice.md`),
    isDraft: false,
    image: `/images/elros-2.jpg`,
    createdAt: `2015-09-29T21:13:36.000Z`,
  },
  {
    id: 7,
    slug: `maltsev_wisdom`,
    title: `Крутить пои. Вчера, сегодня, завтра`,
    authorId: null,
    authorName: `Антон Мальцев`,
    photographerName: ``,
    snippet: `В поинге существует много тонкостей и нюансов. Учитывайте это во время освоения пои!`,
    content: Deno.readTextFileSync(`templates/articles/maltsev_wisdom.md`),
    isDraft: false,
    image: `/images/CG-g_WhZkZI_1_pKioYT4.jpg`,
    createdAt: `2015-10-08T07:58:44.658Z`,
  },
  {
    id: 8,
    slug: `10-truths`,
    title: `Десять банальных истин о тренировках`,
    authorId: 12,
    authorName: ``,
    photographerName: `Константин Заболотный`,
    snippet: `Простые, но важные вещи, которые нужно знать о тренировках с пои.`,
    content: Deno.readTextFileSync(`templates/articles/10-truths.md`),
    isDraft: false,
    image: `/images/Lara_article.jpg`,
    createdAt: `2015-10-31T13:25:26.546Z`,
  },
  {
    id: 9,
    slug: `three-whale`,
    title: `Три кита поинга`,
    authorId: 2,
    authorName: ``,
    photographerName: ``,
    snippet: `Три принципа обучения, понимание и следование которым позволят сделать свои путь в поинге максимально успешным.`,
    content: Deno.readTextFileSync(`templates/articles/three-whale.md`),
    isDraft: false,
    image: `/images/Rikley_2.jpg`,
    createdAt: `2015-11-14T20:48:12.890Z`,
  },
  {
    id: 10,
    slug: `classic_style`,
    title: `Классический стиль в поинге`,
    authorId: 11,
    authorName: ``,
    photographerName: `Александр Шмарин`,
    snippet: `В поинге часто появляются враждующие стили. Будто зарождается молодая религия и опровергает все устои, а в конце-концов оказывается тем же самым.`,
    content: Deno.readTextFileSync(`templates/articles/classic_style.md`),
    isDraft: false,
    image: `/images/aKyvNrTJVZ8.jpg`,
    createdAt: `2015-12-12T20:00:51.997Z`,
  },
  {
    id: 11,
    slug: `3poi`,
    title: `3poi — новый уровень манипуляций`,
    authorId: 29,
    authorName: ``,
    photographerName: ``,
    snippet: `3 пои — это возможность совмещения 3-х основных базовых видов манипуляции: маятники, кручение и жонглирование в одной конструкции.`,
    content: Deno.readTextFileSync(`templates/articles/3poi.md`),
    isDraft: false,
    image: `/images/w_79894406.jpg`,
    createdAt: `2016-03-11T20:33:17.258Z`,
  },
  {
    id: 12,
    slug: `contact`,
    title: `Контактный поинг`,
    authorId: 16,
    authorName: ``,
    photographerName: ``,
    snippet: `За последние несколько лет появилось и сформировалось большое количество направлений в работе с пои:
•	Жонглирование пои
•	3D — поинг
•	Партнер-поинг
•	Кручение 3 и 4 пои одновременно
•	Контактный поинг`,
    content: Deno.readTextFileSync(`templates/articles/contact.md`),
    isDraft: false,
    image: `/images/4h_cimt-928.jpg`,
    createdAt: `2016-05-12T16:18:41.886Z`,
  },
  {
    id: 13,
    slug: `poispiner`,
    title: `Наша вселенная — тот еще спинер!`,
    authorId: 13,
    authorName: ``,
    photographerName: `Григорий Демченко`,
    snippet: `В нашей вселенной крутится почти всё и постоянно. Пожалуй, это одно из самых фундаментальных явлений, наблюдаемых человеком как на уровне астрономическом: планета крутится вокруг собственной оси...`,
    content: Deno.readTextFileSync(`templates/articles/poispiner.md`),
    isDraft: false,
    image: `/images/zHxjNPlqFgk.jpg`,
    createdAt: `2016-05-17T20:54:33.781Z`,
  },
].sort(u.byPkDesc)
