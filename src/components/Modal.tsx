import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

type Props = {
  rank: number;
  dialogOpen: boolean;
  setDialog: (open: boolean) => void;
  userName: string;
};


export const Modal: React.FC<Props> = observer(({ rank, dialogOpen, setDialog, userName }) =>
{
  const handleClose = (reason: any) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown")
      return;

    setDialog(false);
    window.location.href = `/room?name=${userName}`;
  };

  return (
    <React.Fragment>
      <button className="shadow hover:bg-green focus:outline-none text-black text-5xl font-bold py-2 w-full rounded-3xl border-8 border-dark-green"
              type="button"
              onClick={() => setDialog(true)}
      >
        QUIT
      </button>
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={dialogOpen}
        maxWidth="lg"
        fullWidth={true}
        sx={{
          '& .MuiDialogContent-root': {
            backgroundColor: '#f3d34a',
          },
        }}
      >
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 10,
            top: 10,
            color: '#fff',
            padding: '4px',
            bgcolor: '#71e152',
            borderRadius: '16px',
            '&:hover': {
              backgroundColor: '#6ACC4F',
            },
          }}
        >
          <CloseRoundedIcon sx={{
            fontSize: '4rem'
          }} />
        </IconButton>
        <DialogContent dividers>
          <div className='w-full px-8 py-24 flex justify-center items-center gap-8'>
            <img src="/JN.PNG" alt="" className='w-56' />
            <div className="flex flex-col justify-start gap-4 p-2 jersey">
              <span className="text-black text-8xl font-semibold" >
                {userName}
              </span>
              <span className="text-black text-8xl font-semibold" >
                Rank: {rank}
              </span>
            </div>

          </div>
        </DialogContent>
        {/* <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Save changes
          </Button>
        </DialogActions> */}
      </Dialog>
    </React.Fragment>
  );
});
