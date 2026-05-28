const NotificationDot = () => {
  return (
    <div
      style={{
        width: "12px",
        height: "12px",
        backgroundColor: "red",
        borderRadius: "50%",
        boxShadow: "0px 0px 2px indianred",
        position: "absolute",
        top: "0",
        right: "0",
        margin: "4px",
        filter: "drop-shadow(0px 0px 2px red)",
        border: "1px solid mediumvioletred",
      }}
    />
  );
};

export default NotificationDot;
