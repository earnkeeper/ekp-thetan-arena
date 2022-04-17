export type HeroConfigsDto = Readonly<{
  version: number;
  configs: {
    [id: string]: {
      name: string;
      description: string;
      imgSmallDefaultIcon: string;
      role: number;
    };
  };
}>;
