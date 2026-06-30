import { registerRoot, Composition } from "remotion";
import { CaseStudy } from "./CaseStudy";
import type { CaseStudyProps } from "./CaseStudy";

const defaultProps: CaseStudyProps = {
  brand: "Krispy Kreme",
  tagline: "Built a local brand personality that resonated with Egyptian consumers and drove follower growth.",
  role: "Social Strategist",
  year: "2020–2021",
  region: "Egypt",
  accentColor: "#007A3D",
  stats: [
    { label: "Followers gained", value: "120K+" },
    { label: "Avg. engagement rate", value: "8.4%" },
    { label: "Campaigns delivered", value: "24" },
  ],
  services: ["Social Media", "Strategy", "Content"],
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="CaseStudy"
      component={CaseStudy}
      durationInFrames={210}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={defaultProps}
    />
    <Composition
      id="CaseStudyVertical"
      component={CaseStudy}
      durationInFrames={210}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={defaultProps}
    />
  </>
);

registerRoot(RemotionRoot);
