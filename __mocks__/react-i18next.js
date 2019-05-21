module.exports = {
  // this mock makes sure any components using the translate HoC receive the t function as a prop
  withNamespaces: () => Component => {
    Component.defaultProps = { ...Component.defaultProps, t: () => "" };
    return Component;
  },
};
