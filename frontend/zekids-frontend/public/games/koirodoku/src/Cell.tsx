
export const Cell = (props: {
  clickAction: () => void,
  color: string
}) => (
  <button
    class={props.color}
    onClick={() => props.clickAction()}
  ></button>
);

