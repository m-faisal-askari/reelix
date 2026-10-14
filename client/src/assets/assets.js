import icon from "./relix_icon.svg";
import marvelLogo from "./marvelLogo.svg";
import googlePlay from "./googlePlay.svg";
import appStore from "./appStore.svg";
import screenImage from "./screenImage.svg";
import profile from "./profile.png";

export const assets = {
  icon,
  marvelLogo,
  googlePlay,
  appStore,
  screenImage,
  profile,
};

export const dummyTrailers = [
  {
    image:
      "https://i.ytimg.com/vi/irVNGjRFZGk/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLB1aPXPzjLlTO87N8hQSXEwpmt0-g",
    videoUrl: "https://youtu.be/irVNGjRFZGk?si=NxcI4lAqlgT98oX2",
  },
  {
    image:
      "https://i.ytimg.com/vi/NdvqHc56lE0/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLBEME-MLB05pg8lqmj_uBFUn1QYog",
    videoUrl: "https://youtu.be/NdvqHc56lE0?si=62Cn5KpBu3eeMzJt",
  },
  {
    image:
      "https://i.ytimg.com/vi/3fjmjX0QOIg/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLCGRn-2Tkl8IeiuYwcGH1IglGx_hQ",
    videoUrl: "https://youtu.be/3fjmjX0QOIg?si=lh1ip6W1UwbIa62S",
  },
  {
    image:
      "https://i.ytimg.com/vi/zhApeaHMvfs/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLAE_fAGW9UAWtnH-AOPHDG5pXBVOA",
    videoUrl: "https://youtu.be/zhApeaHMvfs?si=PhPjmb8CMK0AeIWw",
  },
];

const dummyCastsData = [
  {
    name: "Robert Downey Jr.",
    profile_path:
      "https://image.tmdb.org/t/p/original/5qHNjhtjMD4YWH3UP0rm4tKwxCL.jpg",
  },
  {
    name: "Chris Evans",
    profile_path:
      "https://image.tmdb.org/t/p/original/3bOGNsHlrswhyW79uvIHH1V43JI.jpg",
  },
  {
    name: "Chris Hemsworth",
    profile_path:
      "https://image.tmdb.org/t/p/original/jpurJ9jAcLCYjgHHfYF32m3zJYm.jpg",
  },
  {
    name: "Pedro Pascal",
    profile_path:
      "https://media.themoviedb.org/t/p/w220_and_h330_face/oKcMbVn0NJTNzQt0ClKKvVXkm60.jpg",
  },
  {
    name: "Timothée Chalamet",
    profile_path:
      "https://image.tmdb.org/t/p/original/BE2sdjpgsa2rNTFa66f7upkaOP.jpg",
  },
  {
    name: "Zendaya",
    profile_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/qGkBlyn1AwQpuFnRARMRwj0iHZp.jpg",
  },
  {
    name: "Jason Momoa",
    profile_path:
      "https://image.tmdb.org/t/p/original/6dEFBpZH8C8OijsynkSajQT99Pb.jpg",
  },
  {
    name: "Florence Pugh",
    profile_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/2URrZb95t3kY6pLroKny3Enmabp.jpg",
  },
  {
    name: "Ryan Gosling",
    profile_path:
      "https://image.tmdb.org/t/p/original/lyUyVARQKhGxaxy0FbPJCQRpiaW.jpg",
  },
  {
    name: "Tom Holland",
    profile_path:
      "https://image.tmdb.org/t/p/original/2qhIDp44cAqP2clOgt2afQI07X8.jpg",
  },
  {
    name: "Tom Hiddleston",
    profile_path:
      "https://image.tmdb.org/t/p/original/mclHxMm8aPlCPKptP67257F5GPo.jpg",
  },
  {
    name: "Benedict Cumberbatch",
    profile_path:
      "https://image.tmdb.org/t/p/original/fBEucxECxGLKVHBznO0qHtCGiMO.jpg",
  },
];

export const dummyShowsData = [
  {
    _id: "avengers-doomsday-2026",
    id: 1001,
    title: "Avengers: Doomsday",
    overview:
      "Marvel's Avengers face an existential threat as heroes from different universes are drawn into a dangerous confrontation with Doctor Doom.",
    poster_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/jzPwsojjFStf5lR5Nm07w2hH56G.jpg",
    backdrop_path:
      "https://media.themoviedb.org/t/p/w500_and_h282_face/4NxnrRmI7goXMsRASwSegf50MC8.jpg",
    genres: [
      { id: 28, name: "Action" },
      { id: 12, name: "Adventure" },
      { id: 878, name: "Science Fiction" },
    ],
    casts: dummyCastsData,
    release_date: "2026-12-18",
    original_language: "en",
    tagline: "The multiverse faces its greatest threat.",
    vote_average: 0,
    vote_count: 0,
    runtime: 165,
  },
  {
    _id: "dune-part-three-2026",
    id: 1002,
    title: "Dune: Part Three",
    overview:
      "Denis Villeneuve continues the epic science-fiction saga based on Frank Herbert's Dune universe, exploring the next chapter of Paul Atreides' story.",
    poster_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/d43fvHQsIMa4kpyhKXw0haEJIvI.jpg",
    backdrop_path:
      "https://media.themoviedb.org/t/p/w500_and_h282_face/eEQLB8tltdpj8btAA9Bc3MvdK1z.jpg",
    genres: [
      { id: 878, name: "Science Fiction" },
      { id: 12, name: "Adventure" },
      { id: 18, name: "Drama" },
    ],
    casts: dummyCastsData,
    release_date: "2026-12-18",
    original_language: "en",
    tagline: "The next chapter of the Dune saga.",
    vote_average: 0,
    vote_count: 0,
    runtime: 145,
  },
  {
    _id: "jumanji-open-world-2026",
    id: 1003,
    title: "Jumanji: Open World",
    overview:
      "The Jumanji adventure returns with a new journey into a dangerous game world where survival depends on teamwork, quick thinking, and a willingness to take risks.",
    poster_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/qv0X60rC2SUWVvOkbgixpRoOSoq.jpg",
    backdrop_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/qv0X60rC2SUWVvOkbgixpRoOSoq.jpg",
    genres: [
      { id: 12, name: "Adventure" },
      { id: 28, name: "Action" },
      { id: 35, name: "Comedy" },
    ],
    casts: dummyCastsData,
    release_date: "2026-12-25",
    original_language: "en",
    tagline: "The game has changed.",
    vote_average: 234.09,
    vote_count: 0,
    runtime: 120,
  },
  {
    _id: "the-beekeeper-2-2027",
    id: 1004,
    title: "The Beekeeper 2",
    overview:
      "Jason Statham returns for another action thriller following the continuing story of a former operative whose personal code of justice puts him against powerful enemies.",
    poster_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/10jGGKeNxY4j6pvJpWLmBzcMeMH.jpg",
    backdrop_path:
      "https://media.themoviedb.org/t/p/w500_and_h282_face/smdkH5T2xiK30dHWPm2LfJcdPME.jpg",
    genres: [
      { id: 28, name: "Action" },
      { id: 53, name: "Thriller" },
    ],
    casts: dummyCastsData,
    release_date: "2027-01-15",
    original_language: "en",
    tagline: "Justice has a new target.",
    vote_average: 0,
    vote_count: 0,
    runtime: 110,
  },
  {
    _id: "ice-age-boiling-point-2027",
    id: 1005,
    title: "Ice Age: Boiling Point",
    overview:
      "The Ice Age gang embarks on another animated adventure as a changing prehistoric world brings new challenges, unexpected encounters, and comic chaos.",
    poster_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/mPhAreyZLLcZ9pl4KRyEaqSu1Zv.jpg",
    backdrop_path:
      "https://media.themoviedb.org/t/p/w500_and_h282_face/beCnQuip6lzuTCRCiErQc5ASwBa.jpg",
    genres: [
      { id: 16, name: "Animation" },
      { id: 10751, name: "Family" },
      { id: 35, name: "Comedy" },
    ],
    casts: dummyCastsData,
    release_date: "2027-02-05",
    original_language: "en",
    tagline: "The adventure is heating up.",
    vote_average: 0,
    vote_count: 0,
    runtime: 95,
  },
  {
    _id: "sonic-the-hedgehog-4-2027",
    id: 1006,
    title: "Sonic the Hedgehog 4",
    overview:
      "Sonic and his friends return for another high-speed adventure in a world where new threats and unexpected alliances test their abilities.",
    poster_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/t8uoHBODkFlSQJRL6qc4IclUBlH.jpg",
    backdrop_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/t8uoHBODkFlSQJRL6qc4IclUBlH.jpg",
    genres: [
      { id: 28, name: "Action" },
      { id: 12, name: "Adventure" },
      { id: 10751, name: "Family" },
    ],
    casts: dummyCastsData,
    release_date: "2027-03-19",
    original_language: "en",
    tagline: "The next adventure starts at full speed.",
    vote_average: 0,
    vote_count: 0,
    runtime: 105,
  },
  {
    _id: "godzilla-x-kong-supernova-2027",
    id: 1007,
    title: "Godzilla x Kong: Supernova",
    overview:
      "Godzilla and Kong return as a new threat emerges, putting humanity and the balance of the Titans' world at risk.",
    poster_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/gEGDDG6QMDFZ1sV32CGxvzaVPnv.jpg",
    backdrop_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/gEGDDG6QMDFZ1sV32CGxvzaVPnv.jpg",
    genres: [
      { id: 28, name: "Action" },
      { id: 878, name: "Science Fiction" },
      { id: 12, name: "Adventure" },
    ],
    casts: dummyCastsData,
    release_date: "2027-03-26",
    original_language: "en",
    tagline: "A new age of Titans.",
    vote_average: 0,
    vote_count: 0,
    runtime: 120,
  },
  {
    _id: "the-legend-of-zelda-2027",
    id: 1008,
    title: "The Legend of Zelda",
    overview:
      "A live-action adaptation of Nintendo's fantasy adventure franchise, bringing the world of Hyrule, its legendary hero, and its ancient mysteries to the big screen.",
    poster_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/4XuaHHQ5eR9czPZPHcaaUjekx5w.jpg",
    backdrop_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/4XuaHHQ5eR9czPZPHcaaUjekx5w.jpg",
    genres: [
      { id: 12, name: "Adventure" },
      { id: 14, name: "Fantasy" },
      { id: 28, name: "Action" },
    ],
    casts: dummyCastsData,
    release_date: "2027-04-30",
    original_language: "en",
    tagline: "A legendary adventure begins.",
    vote_average: 0,
    vote_count: 0,
    runtime: 120,
  },
  {
    _id: "star-wars-starfighter-2027",
    id: 1009,
    title: "Star Wars: Starfighter",
    overview:
      "A new Star Wars adventure set five years after The Rise of Skywalker, introducing an original story and new characters to a galaxy far, far away.",
    poster_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/6LJetiEQjXUE9kDpXavXpZN1Vjk.jpg",
    backdrop_path:
      "https://image.tmdb.org/t/p/original/oVjiUAsIQ4WZ9W6p7ElnXneoho3.jpg",
    genres: [
      { id: 878, name: "Science Fiction" },
      { id: 28, name: "Action" },
      { id: 12, name: "Adventure" },
    ],
    casts: dummyCastsData,
    release_date: "2027-05-28",
    original_language: "en",
    tagline: "A new story in the Star Wars galaxy.",
    vote_average: 0,
    vote_count: 0,
    runtime: 120,
  },
  {
    _id: "spider-man-beyond-spider-verse-2027",
    id: 1010,
    title: "Spider-Man: Beyond the Spider-Verse",
    overview:
      "Miles Morales' animated multiverse journey continues as he confronts the consequences of his previous choices and fights to shape his own destiny.",
    poster_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/9KAe39xqyZnv9J4W3DRGdQqX82h.jpg",
    backdrop_path:
      "https://media.themoviedb.org/t/p/w500_and_h282_face/fnebkdwArjFJfTB62SgK41f8pF6.jpg",
    genres: [
      { id: 16, name: "Animation" },
      { id: 28, name: "Action" },
      { id: 878, name: "Science Fiction" },
    ],
    casts: dummyCastsData,
    release_date: "2027-06-18",
    original_language: "en",
    tagline: "Miles Morales returns.",
    vote_average: 0,
    vote_count: 0,
    runtime: 110,
  },
  {
    _id: "shrek-5-2027",
    id: 1011,
    title: "Shrek 5",
    overview:
      "Shrek returns for another animated adventure filled with fairy-tale characters, irreverent humor, and unexpected complications in the kingdom of Far Far Away.",
    poster_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/m9jLiemA7t2umlXKptDwtIUHU8l.jpg",
    backdrop_path:
      "https://media.themoviedb.org/t/p/w500_and_h282_face/wHbZr627WHFPMpfskRwX6NBgjxv.jpg",
    genres: [
      { id: 16, name: "Animation" },
      { id: 35, name: "Comedy" },
      { id: 10751, name: "Family" },
    ],
    casts: dummyCastsData,
    release_date: "2027-06-30",
    original_language: "en",
    tagline: "The swamp is calling.",
    vote_average: 0,
    vote_count: 0,
    runtime: 100,
  },
  {
    _id: "man-of-tomorrow-2027",
    id: 1012,
    title: "Man of Tomorrow",
    overview:
      "Superman faces a new chapter in his story as the DC universe expands with a major superhero adventure.",
    poster_path:
      "https://media.themoviedb.org/t/p/w220_and_h330_face/1WX7ULzixKFAlownvxpb38rafDe.jpg",
    backdrop_path:
      "https://media.themoviedb.org/t/p/w500_and_h282_face/lX2TpAZxdIus6cnMCDBOrs96NBY.jpg",
    genres: [
      { id: 28, name: "Action" },
      { id: 878, name: "Science Fiction" },
      { id: 12, name: "Adventure" },
    ],
    casts: dummyCastsData,
    release_date: "2027-07-09",
    original_language: "en",
    tagline: "A new chapter in the DC universe.",
    vote_average: 0,
    vote_count: 0,
    runtime: 120,
  },
  {
    _id: "minecraft-movie-squared-2027",
    id: 1013,
    title: "A Minecraft Movie Squared",
    overview:
      "The Minecraft universe returns for another live-action adventure inspired by the world of blocks, crafting, exploration, and survival.",
    poster_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/dTlFgQFiILG6stHBhXMDXblgdCw.jpg",
    backdrop_path:
      "https://media.themoviedb.org/t/p/w500_and_h282_face/Aas6zyCznVr9V175xLB59YroQ9Q.jpg",
    genres: [
      { id: 12, name: "Adventure" },
      { id: 35, name: "Comedy" },
      { id: 10751, name: "Family" },
    ],
    casts: dummyCastsData,
    release_date: "2027-07-23",
    original_language: "en",
    tagline: "Another blocky adventure awaits.",
    vote_average: 0,
    vote_count: 0,
    runtime: 100,
  },
  {
    _id: "a-quiet-place-part-three-2027",
    id: 1014,
    title: "A Quiet Place Part III",
    overview:
      "The survival horror franchise continues in a world where silence remains essential to survival against creatures that hunt by sound.",
    poster_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/37XcaePjgtaga0gB3dFNSc7QnuS.jpg",
    backdrop_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/37XcaePjgtaga0gB3dFNSc7QnuS.jpg",
    genres: [
      { id: 27, name: "Horror" },
      { id: 53, name: "Thriller" },
      { id: 878, name: "Science Fiction" },
    ],
    casts: dummyCastsData,
    release_date: "2027-07-30",
    original_language: "en",
    tagline: "Stay silent. Stay alive.",
    vote_average: 0,
    vote_count: 0,
    runtime: 105,
  },
  {
    _id: "frozen-iii-2027",
    id: 1016,
    title: "Frozen III",
    overview:
      "Anna and Elsa return for another animated fantasy adventure in the kingdom of Arendelle.",
    poster_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/qzVuYNqRX7rBBuUdobS2SWEni5R.jpg",
    backdrop_path:
      "https://media.themoviedb.org/t/p/w500_and_h282_face/AsoITR3tq9PXk0j0VJyN7dkFkp9.jpg",
    genres: [
      { id: 16, name: "Animation" },
      { id: 10751, name: "Family" },
      { id: 14, name: "Fantasy" },
    ],
    casts: dummyCastsData,
    release_date: "2027-11-24",
    original_language: "en",
    tagline: "A new chapter in Arendelle.",
    vote_average: 0,
    vote_count: 0,
    runtime: 100,
  },
  {
    _id: "avengers-secret-wars-2027",
    id: 1017,
    title: "Avengers: Secret Wars",
    overview:
      "Marvel's multiverse saga continues with an epic Avengers event expected to bring together heroes from across different realities.",
    poster_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/f0YBuh4hyiAheXhh4JnJWoKi9g5.jpg",
    backdrop_path:
      "https://media.themoviedb.org/t/p/w500_and_h282_face/pXLgqkNNDjFXVdtHmaH7Iss2fxj.jpg",
    genres: [
      { id: 28, name: "Action" },
      { id: 12, name: "Adventure" },
      { id: 878, name: "Science Fiction" },
    ],
    casts: dummyCastsData,
    release_date: "2027-12-17",
    original_language: "en",
    tagline: "The multiverse reaches its breaking point.",
    vote_average: 0,
    vote_count: 0,
    runtime: 165,
  },
  {
    _id: "lord-of-the-rings-hunt-for-gollum-2027",
    id: 1018,
    title: "The Lord of the Rings: The Hunt for Gollum",
    overview:
      "A new Middle-earth adventure explores the hunt for Gollum and events connected to the wider Lord of the Rings story.",
    poster_path:
      "https://media.themoviedb.org/t/p/w300_and_h450_face/aRtIVdlgVNtvcqFUnuhR3V1RQ7o.jpg",
    backdrop_path:
      "https://media.themoviedb.org/t/p/w500_and_h282_face/aIw4c18EWwQmIWZv0W6s60y47aB.jpg",
    genres: [
      { id: 12, name: "Adventure" },
      { id: 14, name: "Fantasy" },
      { id: 28, name: "Action" },
    ],
    casts: dummyCastsData,
    release_date: "2027-12-17",
    original_language: "en",
    tagline: "A journey into Middle-earth continues.",
    vote_average: 0,
    vote_count: 0,
    runtime: 120,
  },
];

export const dummyDateTimeData = {
  "2026-12-18": [
    { time: "2026-12-18T15:00:00.000Z", showId: "avengers-doomsday-2026" },
    { time: "2026-12-18T18:00:00.000Z", showId: "dune-part-three-2026" },
  ],
  "2026-12-25": [
    { time: "2026-12-25T15:00:00.000Z", showId: "jumanji-open-world-2026" },
  ],
  "2027-01-15": [
    { time: "2027-01-15T15:00:00.000Z", showId: "the-beekeeper-2-2027" },
  ],
  "2027-02-05": [
    { time: "2027-02-05T15:00:00.000Z", showId: "ice-age-boiling-point-2027" },
  ],
  "2027-03-19": [
    { time: "2027-03-19T15:00:00.000Z", showId: "sonic-the-hedgehog-4-2027" },
  ],
  "2027-03-26": [
    {
      time: "2027-03-26T15:00:00.000Z",
      showId: "godzilla-x-kong-supernova-2027",
    },
  ],
  "2027-04-30": [
    { time: "2027-04-30T15:00:00.000Z", showId: "the-legend-of-zelda-2027" },
  ],
  "2027-05-28": [
    { time: "2027-05-28T15:00:00.000Z", showId: "star-wars-starfighter-2027" },
  ],
  "2027-06-18": [
    {
      time: "2027-06-18T15:00:00.000Z",
      showId: "spider-man-beyond-spider-verse-2027",
    },
  ],
  "2027-06-30": [{ time: "2027-06-30T15:00:00.000Z", showId: "shrek-5-2027" }],
  "2027-07-09": [
    { time: "2027-07-09T15:00:00.000Z", showId: "man-of-tomorrow-2027" },
  ],
  "2027-07-23": [
    {
      time: "2027-07-23T15:00:00.000Z",
      showId: "minecraft-movie-squared-2027",
    },
  ],
  "2027-07-30": [
    {
      time: "2027-07-30T15:00:00.000Z",
      showId: "a-quiet-place-part-three-2027",
    },
  ],
  "2027-10-01": [
    { time: "2027-10-01T15:00:00.000Z", showId: "the-great-beyond-2027" },
  ],
  "2027-11-24": [
    { time: "2027-11-24T15:00:00.000Z", showId: "frozen-iii-2027" },
  ],
  "2027-12-17": [
    { time: "2027-12-17T15:00:00.000Z", showId: "avengers-secret-wars-2027" },
    {
      time: "2027-12-17T18:00:00.000Z",
      showId: "lord-of-the-rings-hunt-for-gollum-2027",
    },
  ],
};

export const dummyDashboardData = {
  totalBookings: 14,
  totalRevenue: 1517,
  totalUser: 5,
  activeShows: [
    {
      _id: "68352363e96d99513e4221a4",
      movie: dummyShowsData[0],
      showDateTime: "2025-06-30T02:30:00.000Z",
      showPrice: 59,
      occupiedSeats: {
        A1: "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
        B1: "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
        C1: "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
      },
    },
    {
      _id: "6835238fe96d99513e4221a8",
      movie: dummyShowsData[1],
      showDateTime: "2025-06-30T15:30:00.000Z",
      showPrice: 81,
      occupiedSeats: {},
    },
    {
      _id: "6835238fe96d99513e4221a9",
      movie: dummyShowsData[2],
      showDateTime: "2025-06-30T03:30:00.000Z",
      showPrice: 81,
      occupiedSeats: {},
    },
    {
      _id: "6835238fe96d99513e4221aa",
      movie: dummyShowsData[3],
      showDateTime: "2025-07-15T16:30:00.000Z",
      showPrice: 81,
      occupiedSeats: {
        A1: "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
        A2: "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
        A3: "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
        A4: "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
      },
    },
    {
      _id: "683682072b5989c29fc6dc0d",
      movie: dummyShowsData[4],
      showDateTime: "2025-06-05T15:30:00.000Z",
      showPrice: 49,
      occupiedSeats: {
        A1: "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
        A2: "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
        A3: "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
        B1: "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
        B2: "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
        B3: "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
      },
      __v: 0,
    },
    {
      _id: "68380044686d454f2116b39a",
      movie: dummyShowsData[5],
      showDateTime: "2025-06-20T16:00:00.000Z",
      showPrice: 79,
      occupiedSeats: {
        A1: "user_2xl7eCSUHddibk5lRxfOtw9RMwX",
        A2: "user_2xl7eCSUHddibk5lRxfOtw9RMwX",
      },
    },
  ],
};

export const dummyBookingData = [
  {
    _id: "68396334fb83252d82e17295",
    user: { name: "Millie Jackson" },
    show: {
      _id: "68352363e96d99513e4221a4",
      movie: dummyShowsData[0],
      showDateTime: "2025-06-30T02:30:00.000Z",
      showPrice: 59,
    },
    amount: 98,
    bookedSeats: ["D1", "D2"],
    isPaid: false,
  },
  {
    _id: "68396334fb83252d82e17295",
    user: { name: "Gwen Wilson" },
    show: {
      _id: "68352363e96d99513e4221a4",
      movie: dummyShowsData[0],
      showDateTime: "2025-06-30T02:30:00.000Z",
      showPrice: 59,
    },
    amount: 49,
    bookedSeats: ["A1"],
    isPaid: true,
  },
  {
    _id: "68396334fb83252d82e17295",
    user: { name: "Nancy Grayson" },
    show: {
      _id: "68352363e96d99513e4221a4",
      movie: dummyShowsData[0],
      showDateTime: "2025-06-30T02:30:00.000Z",
      showPrice: 59,
    },
    amount: 147,
    bookedSeats: ["A1", "A2", "A3"],
    isPaid: true,
  },
];
