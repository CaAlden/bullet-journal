import React, { FC } from 'react';
import { IPage } from '../../io/page';
import { Id } from '../../io/db';
import { usePage } from '.';
import DragList from '../DragDrop/DragList';
import { EditEntry, AddEntry } from '../Entry';
import { EntryTypes } from '../../io/entry';
import { useStyle } from '../useStyles';

interface IProps {
  pageId: Id;
  showCompleted: boolean;
}


const DefaultPage: FC<IProps> = ({ pageId, showCompleted }) => {
  const { page, addEntry, setTasks, removeEntry } = usePage(pageId);
  const editableEntries = page.tasks.map(id => ({
    id,
    element: <EditEntry id={id} remove={removeEntry(id)} showCompleted={showCompleted} />,
  }));

  const addEntryContainerClassName = useStyle({
    paddingLeft: '20px',
  });
  return (
    <>
      <DragList items={editableEntries} setItems={setTasks} />
      <div className={addEntryContainerClassName}>
        <AddEntry pageId={pageId} onNew={e => {
          if (e.type !== EntryTypes.Event) {
            // For now, we always want to have the most up to date submit date as possible (but events care a bit more about the date)
            e.date = new Date();
          }
          const addIO = addEntry(e);
          // Immediately perform the IO.
          addIO();
        }} />
      </div>
    </>
  );
};

export default DefaultPage;
