import { useDrag } from "react-dnd";
import "./ControlOption.css";

function ControlOption(props) {
  const [{ isDragging }, drag] = useDrag({
    type: "control-option",
    item: {
      type: "control-option",
      name: props.type,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  return (
    <div
      ref={drag}
      className={"viz-option " + (isDragging ? "viz-option-dragging" : "")}
    >
      <div title={props.type} className={props.type + "-png viz-img tooltip"}>
        <span className="tooltiptext">{props.type}</span>
      </div>
    </div>
  );
}

export default ControlOption;
