import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { useStore } from './StoreContext';

type Props = {
  rank: number;
  dialogOpen: boolean;
  setDialog: (open: boolean) => void;
  userName: string;
  selectedPet: string | null;
};


export const Modal: React.FC<Props> = observer(({ rank, dialogOpen, setDialog, userName, selectedPet }) => {
  const handleClose = (reason: any) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown")
      return;

    setDialog(false);
    window.location.href = `/room?name=${userName}`;
  };

  return (
    <React.Fragment>
      <button className="shadow hover:bg-green focus:outline-none text-black text-3xl font-bold py-1 w-full rounded-xl border-4 border-dark-green"
        type="button"
        onClick={() => {
          setDialog(true);
          setTimeout(() => {
            setDialog(false);
            window.location.href = `/room?name=${userName}`;
          }, 3000);
        }}
      >
        LEAVE GAME
      </button>
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={dialogOpen}
        maxWidth="md"
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
          <div className='w-full px-8 py-20 flex flex-col justify-center items-center gap-2'>
            <div className='w-full flex justify-center items-center gap-8'>
              <img src={`/${selectedPet}.PNG`} alt="" className='w-56' />
              <div className="flex flex-col justify-start gap-4 p-2 jersey truncate">
                <span className="text-black text-8xl font-semibold truncate mb-6" >
                  {userName}
                </span>
                {rank === 1 && <span className="text-6xl text-red font-semibold">You Win !</span>}
                <span className="text-black text-6xl font-semibold" >
                  Rank:
                  <span className='text-red ml-6'>{rank === -1 ? '🤡' : rank}</span>

                </span>
              </div>
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
