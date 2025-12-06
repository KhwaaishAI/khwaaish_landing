interface HomeHeroProps {
  subtitle?: string;
}

export default function HomeHero({ subtitle }: HomeHeroProps) {
  return (
    <div className="text-center text-white px-4 mt-24">
      <h1 className="text-[28px] sm:text-[32px] md:text-[36px] font-semibold tracking-wide flex items-center justify-center gap-2">
        <span>Good to see you Laksh</span>
        <img
          src="/images/Circle.png"
          alt="Decorative spark"
          className="h-16 w-22 object-contain"
        />
      </h1>
      <p className="mt-1 text-sm sm:text-base text-white/85">
        {subtitle ?? "What is your Khwaaish?"}
      </p>
    </div>
  );
}
