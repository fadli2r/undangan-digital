// SweetAlert utility dengan style Metronic
export const showAlert = {
  success: (title, text = '', callback = null) => {
    if (typeof window !== 'undefined' && window.Swal) {
      window.Swal.fire({
        title: title,
        text: text,
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'btn btn-primary',
          popup: 'swal2-show',
          header: 'swal2-header',
          title: 'swal2-title',
          closeButton: 'swal2-close'
        },
        buttonsStyling: false
      }).then((result) => {
        if (callback && typeof callback === 'function') {
          callback(result);
        }
      });
    }
  },

  error: (title, text = '', callback = null) => {
    if (typeof window !== 'undefined' && window.Swal) {
      window.Swal.fire({
        title: title,
        text: text,
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'btn btn-danger',
          popup: 'swal2-show',
          header: 'swal2-header',
          title: 'swal2-title',
          closeButton: 'swal2-close'
        },
        buttonsStyling: false
      }).then((result) => {
        if (callback && typeof callback === 'function') {
          callback(result);
        }
      });
    }
  },

  warning: (title, text = '', callback = null) => {
    if (typeof window !== 'undefined' && window.Swal) {
      window.Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'btn btn-warning',
          popup: 'swal2-show',
          header: 'swal2-header',
          title: 'swal2-title',
          closeButton: 'swal2-close'
        },
        buttonsStyling: false
      }).then((result) => {
        if (callback && typeof callback === 'function') {
          callback(result);
        }
      });
    }
  },

  confirm: (title, text = '', confirmText = 'Ya, Hapus!', cancelText = 'Batal', callback = null) => {
    if (typeof window !== 'undefined' && window.Swal) {
      window.Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        customClass: {
          confirmButton: 'btn btn-danger me-3',
          cancelButton: 'btn btn-light-primary',
          popup: 'swal2-show',
          header: 'swal2-header',
          title: 'swal2-title',
          closeButton: 'swal2-close'
        },
        buttonsStyling: false
      }).then((result) => {
        if (callback && typeof callback === 'function') {
          callback(result);
        }
      });
    }
  },

  loading: (title = 'Loading...', text = 'Mohon tunggu sebentar') => {
    if (typeof window !== 'undefined' && window.Swal) {
      window.Swal.fire({
        title: title,
        text: text,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        customClass: {
          popup: 'swal2-show',
          header: 'swal2-header',
          title: 'swal2-title'
        },
        didOpen: () => {
          window.Swal.showLoading();
        }
      });
    }
  },

  close: () => {
    if (typeof window !== 'undefined' && window.Swal) {
      window.Swal.close();
    }
  }
};

// Toast notifications
export const showToast = {
  success: (message) => {
    if (typeof window !== 'undefined' && window.Swal) {
      const Toast = window.Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: 'swal2-toast-success',
          title: 'swal2-toast-title'
        },
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', window.Swal.stopTimer);
          toast.addEventListener('mouseleave', window.Swal.resumeTimer);
        }
      });

      Toast.fire({
        icon: 'success',
        title: message
      });
    }
  },

  error: (message) => {
    if (typeof window !== 'undefined' && window.Swal) {
      const Toast = window.Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        customClass: {
          popup: 'swal2-toast-error',
          title: 'swal2-toast-title'
        },
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', window.Swal.stopTimer);
          toast.addEventListener('mouseleave', window.Swal.resumeTimer);
        }
      });

      Toast.fire({
        icon: 'error',
        title: message
      });
    }
  },

  info: (message) => {
    if (typeof window !== 'undefined' && window.Swal) {
      const Toast = window.Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: 'swal2-toast-info',
          title: 'swal2-toast-title'
        },
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', window.Swal.stopTimer);
          toast.addEventListener('mouseleave', window.Swal.resumeTimer);
        }
      });

      Toast.fire({
        icon: 'info',
        title: message
      });
    }
  }
};
