export type Work = {
  slug: string;
  area: string;
  title: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
};

export const works: Work[] = [
  {
    slug: "nagareyama-light-wood",
    area: "千葉県流山市",
    title: "光と木に包まれる家",
    image: "/images/works/nagareyama-light-wood.jpg",
    imageWidth: 1536,
    imageHeight: 1024,
  },
  {
    slug: "kashiwa-hiraya",
    area: "千葉県柏市",
    title: "家族が集まる平屋",
    image: "/images/works/kashiwa-hiraya.jpg",
    imageWidth: 1672,
    imageHeight: 941,
  },
  {
    slug: "matsudo-natural",
    area: "千葉県松戸市",
    title: "自然とつながる家",
    image: "/images/works/matsudo-natural.jpg",
    imageWidth: 1672,
    imageHeight: 941,
  },
];