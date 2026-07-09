import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// Format date to display
export const formatDate = (date, format = 'DD MMM YYYY') => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

// Format date + time
export const formatDateTime = (date) => {
  if (!date) return '-';
  return dayjs(date).format('DD MMM YYYY, hh:mm A');
};

// Relative time (2 hours ago, 3 days ago)
export const timeAgo = (date) => {
  if (!date) return '-';
  return dayjs(date).fromNow();
};

// Days until date (positive = future, negative = past/overdue)
export const daysUntil = (date) => {
  if (!date) return 0;
  return dayjs(date).diff(dayjs(), 'day');
};

// Is date overdue?
export const isOverdue = (date) => {
  if (!date) return false;
  return dayjs(date).isBefore(dayjs());
};

// Format for date input (YYYY-MM-DD)
export const toDateInput = (date) => {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD');
};

// Format for datetime-local input
export const toDateTimeInput = (date) => {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DDTHH:mm');
};