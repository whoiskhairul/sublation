import React from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';

function NotificationSnackBar({ open, onClose, severity, message }) {
    return (
        <Snackbar
            open={open}
            autoHideDuration={2000}  // 2 seconds
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            TransitionComponent={Slide}
            TransitionProps={{ direction: "up" }}
        >
            <Alert onClose={onClose} variant="filled" severity={severity} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    );
}

export default NotificationSnackBar;



//1.  define these variables in the component
//   const [open, setOpen] = useState(false);
//   const [notifMessage, setNotifMessage] = useState('');
//   const [notifSeverity, setNotifSeverity] = useState('success');


//2.  add this code to htmx component
{/* <NotificationSnackBar
    open={open}
    onClose={handleClose}
    severity={notifSeverity}
    message={notifMessage}
/> */}


//3.  add this function in the conponent
// const handleClose = (event, reason) => {
//     if (reason === 'clickaway') {
//       return;  // ignore if user clicks away
//     }
//     setOpen(false);
//   };



//4.  add this to call the snackbar
// setNotifMessage('BPMN DIagram has been successfully imported.');
//         setNotifSeverity('success');
//         setOpen(true);