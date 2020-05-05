import React, { useState } from 'react';
import { IPage } from '../io/page';
import { v4 } from 'uuid';
import { useStyles } from './useStyles';
import { IO } from 'fp-ts/lib/IO';
import { Button } from './Button';
import { useColors } from '../Colors';

interface IProps {
  onNew: (page: IPage) => IO<void>;
}

const getDefaults = (): IPage => ({
  id: v4(),
  name: '',
  start: new Date(),
  end: new Date(),
  tasks: [],
});

const NewPageInput: React.FC<IProps> = ({ onNew }) => {
  const [name, setName] = useState('');
  const onSubmit = () => {
    if (name !== '') {
      onNew({
        ...getDefaults(),
        name,
      })();

      setName('');
    }
  };

  const classes = useStyles({
    container: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    input: {
      outline: 'none',
      border: 'none',
      font: 'inherit',
      background: 'inherit',
    },
  });
  const colors = useColors();
  return (
    <div className={classes.container}>
      <input className={classes.input} value={name} onChange={e => setName(e.target.value)} placeholder="Input new page name"/>
      <Button
        hoverColor={colors.white}
        hoverBackground={colors.green}
        disabled={name === ''}
        onClick={onSubmit}
        style={{
          fontSize: '1.25em',
          fontWeight: 'bold',
        }}
      >+</Button>
    </div>
  );
};

export default NewPageInput;
