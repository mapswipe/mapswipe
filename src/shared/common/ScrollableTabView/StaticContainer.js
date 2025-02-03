import React from 'react';

type Props = {
    shouldUpdate: boolean,
    children: React.ReactNode,
};

class StaticContainer extends React.Component<Props> {
    shouldComponentUpdate(nextProps: Props): boolean {
        return !!nextProps.shouldUpdate;
    }

    // eslint-disable-next-line no-undef
    render(): ?React.ReactElement {
        const { children } = this.props;
        if (children === null || children === false) {
            return null;
        }
        return React.Children.only(children);
    }
}

export default StaticContainer;
