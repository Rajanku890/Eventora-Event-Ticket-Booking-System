const events = {
  'Neon Nights Festival': { price: 799, date: '24 October 2026' },
  'Champions Cricket Clash': { price: 499, date: '2 November 2026' },
  'Beyond the Stars': { price: 299, date: '8 November 2026' }
};

const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.textContent = isOpen ? '✕' : '☰';
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.textContent = '☰';
}));

// Level 4: Book buttons select the event and scroll to the booking form.
document.querySelectorAll('.book-event').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.book-event').forEach(other => {
      other.classList.remove('selected');
      other.innerHTML = 'Book ticket <span>↗</span>';
    });
    button.classList.add('selected');
    button.innerHTML = 'Selected ✓';
    document.getElementById('eventSelect').value = button.dataset.event;
    updateBookingSummary();
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
  });
});

// Show/hide extra information on each event card.
document.querySelectorAll('.details-toggle').forEach(button => {
  button.addEventListener('click', () => {
    const details = button.nextElementSibling;
    const willOpen = details.hidden;
    details.hidden = !willOpen;
    button.setAttribute('aria-expanded', String(willOpen));
    button.innerHTML = `${willOpen ? 'Hide event details' : 'View event details'} <span>${willOpen ? '−' : '＋'}</span>`;
  });
});

// Event category filter and text search.
let activeFilter = 'all';
const eventCards = [...document.querySelectorAll('.event-card')];
const searchInput = document.getElementById('eventSearch');
function filterEvents() {
  const query = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;
  eventCards.forEach(card => {
    const categoryMatches = activeFilter === 'all' || card.dataset.category === activeFilter;
    const textMatches = card.dataset.search.includes(query) || card.querySelector('h3').textContent.toLowerCase().includes(query);
    const show = categoryMatches && textMatches;
    card.hidden = !show;
    if (show) visibleCount++;
  });
  document.getElementById('noResults').hidden = visibleCount !== 0;
}
document.querySelectorAll('.filter-btn').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter-btn').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  activeFilter = button.dataset.filter;
  filterEvents();
}));
searchInput.addEventListener('input', filterEvents);

// Booking total and event date update as the user changes selections.
const eventSelect = document.getElementById('eventSelect');
const ticketCount = document.getElementById('ticketCount');
function updateBookingSummary() {
  const selectedEvent = events[eventSelect.value];
  const count = Number(ticketCount.value) || 1;
  document.getElementById('estimatedTotal').textContent = selectedEvent
    ? `₹${(selectedEvent.price * count).toLocaleString('en-IN')}`
    : '₹0';
  document.getElementById('eventDate').value = selectedEvent ? selectedEvent.date : 'Choose an event first';
}
eventSelect.addEventListener('change', updateBookingSummary);
ticketCount.addEventListener('change', updateBookingSummary);

const form = document.getElementById('bookingForm');
const bookingSuccess = document.getElementById('bookingSuccess');
function showError(id, message, inputId) {
  document.getElementById(id).textContent = message;
  if (inputId) document.getElementById(inputId).classList.toggle('input-invalid', Boolean(message));
}
function clearErrors() {
  showError('nameError', '', 'fullName');
  showError('emailError', '', 'email');
  showError('eventError', '', 'eventSelect');
}
form.addEventListener('submit', event => {
  event.preventDefault();
  clearErrors();
  bookingSuccess.hidden = true;
  const name = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const chosenEvent = eventSelect.value;
  let valid = true;
  if (name.length < 2) { showError('nameError', 'Please enter your name (at least 2 characters).', 'fullName'); valid = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('emailError', 'Please enter a valid email address.', 'email'); valid = false; }
  if (!chosenEvent || !events[chosenEvent]) { showError('eventError', 'Please select an event.', 'eventSelect'); valid = false; }
  if (!valid) {
    const firstInvalid = form.querySelector('.input-invalid');
    if (firstInvalid) firstInvalid.focus();
    return;
  }
  const count = Number(ticketCount.value);
  const total = events[chosenEvent].price * count;
  bookingSuccess.innerHTML = `<strong>✓ Demo booking confirmed!</strong><br>Thank you, ${escapeHtml(name)}.<br>Event: ${escapeHtml(chosenEvent)}<br>Date: ${events[chosenEvent].date}<br>Tickets: ${count}<br>Estimated total: <strong>₹${total.toLocaleString('en-IN')}</strong><br><small>This is a demonstration only. No payment was taken and no real ticket was issued.</small>`;
  bookingSuccess.hidden = false;
  bookingSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
