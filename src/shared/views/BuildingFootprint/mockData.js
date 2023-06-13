// @flow
export type AdditionalOption = {
    reason: number,
    description: string,
};

export type Block =
    | {
          blockNumber: number,
          blockType: 'image',
          image: string,
      }
    | {
          blockNumber: number,
          blockType: 'text',
          textDescription: string,
      };

export type ProjectInformation = Array<Block[]>;

export type Option = {
    option: number,
    title: string,
    description: string,
    icon: string,
    iconColor: string,
    reasons?: Array<AdditionalOption>,
};

export const informationPages: ProjectInformation[] = [];
