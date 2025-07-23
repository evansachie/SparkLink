export const getConfirmButtonVariant = (type='warning') => {
    switch (type) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "info":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      default:
        return "bg-orange-600 hover:bg-orange-700 text-white";
    }
};
