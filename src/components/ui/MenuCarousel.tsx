import { useState } from "react";

const pages = [
  {
    title: "ABOUT",
    jp: "私について",
    url: "/about",
    image: "/menu/about.jpg",
    desc: "Who am I."
  },
  {
    title: "PROJECTS",
    jp: "プロジェクト",
    url: "/projects",
    image: "/menu/projects.jpg",
    desc: "Selected Works."
  },
  {
    title: "GALLERY",
    jp: "ギャラリー",
    url: "/gallery",
    image: "/menu/gallery.jpg",
    desc: "Visual Exploration."
  },
  {
    title: "BLOG",
    jp: "ブログ",
    url: "/blog",
    image: "/menu/blog.jpg",
    desc: "Thoughts."
  },
  {
    title: "CONTACT",
    jp: "連絡する",
    url: "/contact",
    image: "/menu/contact.jpg",
    desc: "Get In Touch."
  }
];

export default function MenuCarousel() {
  const [active, setActive] = useState(2);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="relative w-full h-[700px]">
        {pages.map((item, index) => {
          const offset = index - active;

          return (
            <a
              key={item.title}
              href={item.url}
              className="absolute left-1/2 top-1/2 transition-all duration-700"
              style={{
                transform: `
                  translate(-50%, -50%)
                  translateX(${offset * 320}px)
                  scale(${offset === 0 ? 1 : 0.8})
                `,
                zIndex: 100 - Math.abs(offset)
              }}
            >
              <div
                className={`
                  relative w-[380px] h-[540px] overflow-hidden border border-white/20
                  ${offset === 0 ? "opacity-100" : "opacity-30"}
                `}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/20" />

                <div className="absolute inset-0 backdrop-blur-[1px]" />

                <div className="absolute inset-0 flex flex-col justify-between p-8">
                  <div>
                    <div className="text-xl tracking-widest text-white/60">
                      0{index + 1}
                    </div>
                    <div className="text-lg text-white/50">
                      {item.jp}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-6xl font-bold mb-4">
                      {item.title}
                    </h2>
                    <p className="text-white/60">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}