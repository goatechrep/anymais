export const feedbackService = {
  alert(message: string) {
    window.alert(message);
  },
  confirm(message: string) {
    return window.confirm(message);
  },
};
