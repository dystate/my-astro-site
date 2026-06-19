import { ReactLenis } from 'lenis/react';
import { useTransform, motion, useScroll } from 'motion/react';
import type { MotionValue } from 'motion/react';
import { useRef, forwardRef } from 'react';

interface ProjectData {
  title: string;
  description: string;
  link: string;
  color: string;
  href: string;
}

interface CardProps {
  i: number;
  title: string;
  description: string;
  href: string;
  color: string;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}

export const Card = ({
  i,
  title,
  description,
  href,
  color,
  progress,
  range,
  targetScale,
}: CardProps) => {
  const container = useRef(null);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      ref={container}
      className='h-screen flex items-center justify-center sticky top-0'
    >
      <motion.div
        style={{
          scale,
          top: `calc(-5vh + ${i * 25}px)`,
        }}
        className='flex flex-col relative -top-[25%] h-[450px] w-[460px] p-0 origin-top
                   bg-white dark:bg-[#2a2a2a] border-4 border-black dark:border-gray-600 shadow-[10px_10px_0_0_#000] dark:shadow-[10px_10px_0_0_rgba(255,255,255,0.15)]'
      >
        {/* top accent bar */}
        <div
          style={{ backgroundColor: color }}
          className='h-3 w-full flex-shrink-0 border-b-4 border-black dark:border-gray-600'
        />

        <div className='flex flex-col flex-1 p-8 min-h-0 items-center justify-center text-center'>
          <h2 className='text-3xl font-black uppercase tracking-tight text-black dark:text-white mb-4'>
            {title}
          </h2>
          <p className='text-sm font-medium text-gray-800 dark:text-gray-300 leading-relaxed max-w-md'>
            {description}
          </p>
          <div className='pt-5'>
            <a
              href={href}
              className='inline-block bg-black dark:bg-white dark:text-black text-white font-bold text-xs uppercase
                         tracking-widest px-4 py-2 border-2 border-black dark:border-white
                         hover:bg-white hover:text-black dark:hover:bg-gray-300 transition-colors no-underline'
            >
              进入
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface ComponentRootProps {
  projects: ProjectData[];
}

const StackingCard = forwardRef<HTMLElement, ComponentRootProps>(
  ({ projects }, ref) => {
    const container = useRef(null);
    const { scrollYProgress } = useScroll({
      target: container,
      offset: ['start start', 'end end'],
    });

    return (
      <ReactLenis root>
        <main className='bg-[#e5e5e5] dark:bg-[#1a1a1a]' ref={container}>
          {/* ── hero ── */}
          <section className='relative text-black dark:text-white h-[70vh] w-full bg-[#d5d5d5] dark:bg-[#2a2a2a] grid place-content-center border-b-4 border-black dark:border-gray-700'>
            <div className='absolute inset-0 opacity-[0.12] dark:opacity-[0.08] pointer-events-none hero-dots' />

            <h1 className='relative z-10 2xl:text-7xl text-5xl px-8 font-black text-center tracking-tight leading-[110%] uppercase'>
              <a href='/' className='text-black dark:text-white hover:text-[#5451f2] transition-colors no-underline'>
                Dystate
              </a>
              <br />
              <span className='text-2xl 2xl:text-3xl font-bold tracking-[0.3em] text-gray-600 dark:text-gray-400'>
                THIS IS A MENU
              </span>
            </h1>
          </section>

          {/* ── cards ── */}
          <section className='w-full bg-[#e5e5e5] dark:bg-[#1a1a1a]'>
            {projects.map((project, i) => {
              const targetScale = 1 - (projects.length - i) * 0.05;
              return (
                <Card
                  key={`p_${i}`}
                  i={i}
                  href={project.href}
                  title={project.title}
                  color={project.color}
                  description={project.description}
                  progress={scrollYProgress}
                  range={[i * 0.25, 1]}
                  targetScale={targetScale}
                />
              );
            })}
          </section>

          {/* ── footer ── */}
          <footer className='bg-black dark:bg-gray-800 border-t-4 border-black dark:border-gray-700'>
            <h1 className='text-[16vw] translate-y-16 leading-[90%] uppercase font-black text-center bg-gradient-to-r from-gray-400 via-white to-gray-600 dark:from-gray-600 dark:via-gray-300 dark:to-gray-500 bg-clip-text text-transparent'>
              DYSTATE
            </h1>
            <div className='bg-[#e5e5e5] dark:bg-[#1a1a1a] h-32 relative z-10 grid place-content-center border-t-4 border-black dark:border-gray-700'>
              <span className='text-sm font-bold text-gray-500 dark:text-gray-400 tracking-[0.3em] uppercase'>
                © 2026
              </span>
            </div>
          </footer>
        </main>
      </ReactLenis>
    );
  }
);

StackingCard.displayName = 'StackingCard';

export default StackingCard;
