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
    facultyGrid.style.display = 'block';
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
    const item = createFacultyCard(faculty);
    facultyGrid.appendChild(item);
  });
}

// ===== CREATE FACULTY CARD =====
function createFacultyCard(faculty) {
  // Compact list item with thumbnail on the left
  const item = document.createElement('div');
  item.className = 'faculty-list-item';
  item.onclick = () => openModal(faculty);

  const availabilityClass = faculty.availability ? 'available' : 'busy';
  // Show clear availability label in list (dot + text)
  const availabilityText = faculty.availability ? '● Available' : '● Busy';

  item.innerHTML = `
    <img src="${faculty.photo}" alt="${faculty.name}" class="list-photo">
    <div class="list-body">
      <div class="list-top">
        <div>
          <div class="list-name">${faculty.name}</div>
          <div class="list-meta">${faculty.designation} • <span class="list-dept">${faculty.department}</span></div>
        </div>
        <div class="list-right">
          <span class="availability-badge ${availabilityClass}" role="status" aria-label="${availabilityText}">${availabilityText}</span>
        </div>
      </div>
      <div class="list-bottom">
        <span class="list-location">${faculty.location}</span>
        <span class="list-email">${faculty.email}</span>
      </div>
    </div>
  `;

  return item;
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
  
  // Normalize and map department names so aliases like "Maths" match "Mathematics"
  function normalizeDeptName(name) {
    if (!name) return '';
    return name.toString().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9 ]+/g, '').trim();
  }

  function canonicalDept(name) {
    const n = normalizeDeptName(name);
    // simple alias map — extend if you have more mismatches
    const aliases = {
      'maths': 'mathematics',
      'math': 'mathematics'
    };
    return aliases[n] || n;
  }

  const normalizedCurrent = canonicalDept(currentDepartment);

  filteredFaculty = allFaculty.filter(faculty => {
    const matchesSearch = faculty.name.toLowerCase().includes(searchTerm);
    const facultyDeptCanonical = canonicalDept(faculty.department);

    const matchesDepartment = currentDepartment === 'All' ||
      facultyDeptCanonical === normalizedCurrent ||
      facultyDeptCanonical.includes(normalizedCurrent) ||
      normalizedCurrent.includes(facultyDeptCanonical);

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