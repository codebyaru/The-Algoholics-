// ===== GLOBAL VARIABLES =====
let allFaculty = [];
let filteredFaculty = [];
let currentDepartment = 'All';

// ===== DOM ELEMENTS =====
const loadingSpinner = document.getElementById('loadingSpinner');
const facultyGrid = document.getElementById('facultyGrid');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const darkModeToggle = document.getElementById('darkModeToggle');
const modal = document.getElementById('facultyModal');
const modalClose = document.querySelector('.modal-close');
const noResults = document.getElementById('noResults');

// ===== FETCH FACULTY DATA FROM BACKEND =====
async function fetchFacultyData() {
  try {
    showLoading(true);
    const response = await fetch('/api/faculty');
    
    if (!response.ok) {
      throw new Error('Failed to fetch faculty data');
    }
    
    const data = await response.json();
    allFaculty = data;
    filteredFaculty = data;
    
    renderFacultyCards();
    showLoading(false);
  } catch (error) {
    console.error('Error fetching faculty data:', error);
    showLoading(false);
    facultyGrid.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #ef4444;">
        <p style="font-size: 1.25rem; font-weight: 600;">⚠️ Error loading faculty data</p>
        <p style="margin-top: 0.5rem;">Please make sure the server is running</p>
      </div>
    `;
  }
}

// ===== SHOW/HIDE LOADING SPINNER =====
function showLoading(show) {
  if (show) {
    loadingSpinner.classList.remove('hidden');
    facultyGrid.style.display = 'none';
  } else {
    loadingSpinner.classList.add('hidden');
    facultyGrid.style.display = 'grid';
  }
}

// ===== RENDER FACULTY CARDS =====
function renderFacultyCards() {
  facultyGrid.innerHTML = '';
  
  if (filteredFaculty.length === 0) {
    noResults.style.display = 'block';
    return;
  }
  
  noResults.style.display = 'none';
  
  filteredFaculty.forEach(faculty => {
    const card = createFacultyCard(faculty);
    facultyGrid.appendChild(card);
  });
}

// ===== CREATE FACULTY CARD =====
function createFacultyCard(faculty) {
  const card = document.createElement('div');
  card.className = 'faculty-card';
  card.onclick = () => openModal(faculty);
  
  const availabilityClass = faculty.availability ? 'available' : 'busy';
  const availabilityText = faculty.availability ? '● Available' : '● Busy';
  
  card.innerHTML = `
    <div class="card-header">
      <img src="${faculty.photo}" alt="${faculty.name}" class="card-photo">
      <span class="availability-badge ${availabilityClass}">${availabilityText}</span>
    </div>
    <div class="card-body">
      <h3 class="card-name">${faculty.name}</h3>
      <p class="card-designation">${faculty.designation}</p>
      <p class="card-department">${faculty.department}</p>
      
      <div class="card-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>${faculty.location}</span>
      </div>
      
      <div class="card-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${faculty.email}</span>
      </div>
      
      <button class="card-btn">View Details</button>
    </div>
  `;
  
  return card;
}

// ===== OPEN MODAL WITH FACULTY DETAILS =====
function openModal(faculty) {
  document.getElementById('modalPhoto').src = faculty.photo;
  document.getElementById('modalName').textContent = faculty.name;
  document.getElementById('modalDesignation').textContent = faculty.designation;
  document.getElementById('modalDepartment').textContent = faculty.department;
  document.getElementById('modalDescription').textContent = faculty.description;
  document.getElementById('modalLocation').textContent = faculty.location;
  document.getElementById('modalEmail').textContent = faculty.email;
  document.getElementById('modalEmail').href = `mailto:${faculty.email}`;
  
  const availabilityBadge = document.getElementById('modalAvailability');
  if (faculty.availability) {
    availabilityBadge.textContent = '● Currently Available';
    availabilityBadge.className = 'availability-badge available';
  } else {
    availabilityBadge.textContent = '● Currently Busy';
    availabilityBadge.className = 'availability-badge busy';
  }
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// ===== CLOSE MODAL =====
function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

// ===== FILTER FACULTY =====
function filterFaculty() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  filteredFaculty = allFaculty.filter(faculty => {
    const matchesSearch = faculty.name.toLowerCase().includes(searchTerm);
    const matchesDepartment = currentDepartment === 'All' || faculty.department === currentDepartment;
    return matchesSearch && matchesDepartment;
  });
  
  // Sort alphabetically
  filteredFaculty.sort((a, b) => a.name.localeCompare(b.name));
  
  renderFacultyCards();
}

// ===== DARK MODE TOGGLE =====
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDarkMode);
}

// ===== EVENT LISTENERS =====

// Search input
searchInput.addEventListener('input', filterFaculty);

// Department filter buttons
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Remove active class from all buttons
    filterButtons.forEach(btn => btn.classList.remove('active'));
    // Add active class to clicked button
    button.classList.add('active');
    // Update current department
    currentDepartment = button.getAttribute('data-dept');
    // Filter faculty
    filterFaculty();
  });
});

// Dark mode toggle
darkModeToggle.addEventListener('click', toggleDarkMode);

// Modal close button
modalClose.addEventListener('click', closeModal);

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    closeModal();
  }
});

// ===== INITIALIZE APP =====

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
}

// Fetch faculty data when page loads
document.addEventListener('DOMContentLoaded', () => {
  fetchFacultyData();
});

// ===== SMOOTH SCROLL (OPTIONAL) =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});