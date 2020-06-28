import React, { FC, ReactElement } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Id } from '../../io/db';
import { useColors } from '../../Colors';

const Droppable = Symbol('Droppable');

interface IDroppable {
  type: typeof Droppable;
  id: string;
  pos: number;
}

interface ICellProps {
  id: string;
  pos: number;
  reorder: (id: string, pos: number) => void
}

const FLEX = {
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
} as const;

const DragDropCell: FC<ICellProps> = ({ children, id, pos, reorder }) => {
  const [dropStyles, drop] = useDrop<IDroppable, void, any>({
    accept: Droppable,
    drop: (item) => {
      reorder(item.id, pos);
    },
    collect: (monitor) => {
      const item = monitor.getItem();
      const draggingFromAbove = item && item.pos < pos;
      const draggingFromBelow = item && item.pos > pos;
      return ({
        background: '#ddd',
        ...(draggingFromAbove && {
          paddingBottom: monitor.isOver() ? '40px' : '0',
        }),
        ...(draggingFromBelow && {
          paddingTop: monitor.isOver() ? '40px' : '0',
        }),
        transition: 'padding 250ms ease-in-out',
      });
    },
  });

  const colors = useColors();

  const [dragging, drag] = useDrag({
    item: { id, type: Droppable, pos },
    collect: (monitor) => ({
      background: colors.white,
      cursor: 'grab',
      opacity: monitor.isDragging() ? 0.2 : 1,
      transition: 'opacity 100ms ease-in-out',
    }),
  });

  console.log()
  return (
    <div
      style={{
        ...FLEX,
        ...dropStyles,
      }}
      ref={drop}
    >
      <div
        style={{
          ...FLEX,
          ...dragging,
        }}
        ref={drag}
      >
        {children}
      </div>
    </div>
  );
};

interface TrackableComponent {
  id: Id,
  element: ReactElement;
}

interface IProps {
  items: TrackableComponent[];
  setItems: (ids: Id[]) => void;
}

const DragList: FC<IProps> = ({ items, setItems }) => {
  const reorder = (id: Id, pos: number) => {
    const current = items.map(({ id: tId }) => tId);
    const item = current.find((tId) => tId === id);
    if (item === undefined) {
      throw new Error(`Bad id: ${id}`);
    }

    const removed = current.filter((tId) => id !== tId);

    setItems([...removed.slice(0, pos), item, ...removed.slice(pos)]);
  };

  return (
    <div style={FLEX}>{
      items.map(({ id, element }, pos) =>
        <DragDropCell key={id} id={id} pos={pos} reorder={reorder} children={element} />
      )}
    </div>
  );
};

export default DragList;
