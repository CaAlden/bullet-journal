import React, { FC, useState, useMemo } from 'react';
import { Button } from '../Button';
import { useColors } from '../../Colors';
import { useStorage } from '../../io/db';
import { Tooltip } from '@material-ui/core';
import Update from '@material-ui/icons/Update';
import Download from '@material-ui/icons/CloudDownload';
import { useStyles } from '../useStyles';

const SavePage: FC<{ leave: () => void }> = ({ leave }) => {
  const colors = useColors();
  const db = useStorage();

  const [textValue, setTextValue] = useState(JSON.stringify(localStorage));
  const downloadJSON = useMemo(() => {
    const file = new Blob([textValue], { type: 'text/plain' });
    return URL.createObjectURL(file);
  }, [textValue]);
  const downloadName = useMemo(() => {
    const now = new Date(Date.now());
    return `bullet-journal-backup-${now.getDay()}-${now.getMonth()}-${now.getFullYear()}.json`;
  }, []);

  const classes = useStyles({
    section: {
      display: 'grid',
      gridTemplateRows: 'min-content 1fr min-content',
      flexGrow: 1,
    },
    textArea: {
      flexGrow: 1,
    },
    buttonGroup: {
      display: 'flex',
      padding: '20px',
    },
  });

  return (
    <section className={classes.section}>
      <header>
        <h1>Backup Storage Data</h1>
      </header>

      <textarea className={classes.textArea} value={textValue} onChange={e => setTextValue(e.target.value)} />
      <div className={classes.buttonGroup}>
        <a href={downloadJSON} download={downloadName}>
          <Button onClick={() => {}} hoverColor={colors.white} hoverBackground={colors.blue}>
            <Tooltip title="Download Current State">
              <Download style={{ height: '20px', width: '20px', cursor: 'pointer' }} />
            </Tooltip>
          </Button>
        </a>
        <Button onClick={() => {
          if (window.confirm('Are you sure? This will fully replace the local storage state!')) {
            let obj = {};
            try {
              if (textValue.replace(/\s+/g,'') !== '') {
                obj = JSON.parse(textValue);
              }
            } catch (e) {
              console.warn(e);
              return;
            }
            db.setIgnore(true);
            localStorage.clear();
            Object.entries(obj).forEach(([k, v]) => {
              if (typeof v === 'string') {
                localStorage.setItem(k, v);
              } else {
                localStorage.setItem(k, JSON.stringify(v));
              }
            });
            db.setIgnore(false);
            db.notifyAll()
            leave();
          }
        }} hoverColor={colors.white} hoverBackground={colors.orange}>
          <Tooltip title="Commit current value to local storage">
            <Update style={{ height: '20px', width: '20px', cursor: 'pointer' }} />
          </Tooltip>
        </Button>
      </div>
    </section>
  );
};

export default SavePage;
