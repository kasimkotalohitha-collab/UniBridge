-- Migration 003: Seed university academic departments and campus events

insert into public.departments (name, code, description)
values
  ('Computer Science and Engineering (CSE)', 'CSE', 'Department of Computer Science and Engineering. Programming, Algorithms, Systems, and Software.'),
  ('Information Technology (IT)', 'IT', 'Department of Information Technology. Networks, Cloud Computing, Databases, and Information Systems.'),
  ('Electronics and Communication Engineering (ECE)', 'ECE', 'Department of Electronics and Communication. VLSI, Embedded Systems, Signal Processing, and Telecommunications.'),
  ('Electrical and Electronics Engineering (EEE)', 'EEE', 'Department of Electrical and Electronics Engineering. Power Systems, Control Engineering, and Renewable Energy.'),
  ('Mechanical Engineering (ME)', 'ME', 'Department of Mechanical Engineering. Thermodynamics, Robotics, CAD/CAM, and Manufacturing.'),
  ('Civil Engineering (CE)', 'CE', 'Department of Civil Engineering. Structural Engineering, Geotechnical, and Environmental Infrastructure.'),
  ('Artificial Intelligence and Data Science (AI & DS)', 'AI_DS', 'Department of AI and Data Science. Machine Learning, Deep Learning, Big Data Analytics, and NLP.'),
  ('Mathematics', 'MATH', 'Department of Mathematics. Applied Calculus, Linear Algebra, Statistics, and Discrete Mathematics.'),
  ('Physics', 'PHYS', 'Department of Physics. Applied Physics, Quantum Mechanics, Optics, and Materials Science.'),
  ('English', 'ENG', 'Department of English & Humanities. Technical Communication, Professional Ethics, and Literature.')
on conflict (name) do nothing;

-- Sample Campus Events for Community
insert into public.campus_events (title, description, organizer, location, event_date, category)
values
  (
    'Annual Campus Hackathon 2026', 
    'Join 300+ students across engineering and design for 24 hours of innovation and building solutions for student life.', 
    'UniBridge Tech Club', 
    'Central Innovation Hub, Hall B', 
    now() + interval '5 days', 
    'Technology'
  ),
  (
    'Campus Town Hall & Feedback Forum', 
    'Open dialogue with the Dean of Student Affairs and Department Heads regarding campus renovations and new dining facilities.', 
    'Student Council', 
    'Main Auditorium', 
    now() + interval '12 days', 
    'Governance'
  ),
  (
    'Inter-Collegiate Badminton & Basketball Championship', 
    'Annual sports tournament featuring 16 universities. Come cheer for the home team!', 
    'Department of Physical Education', 
    'Indoor Sports Complex', 
    now() + interval '18 days', 
    'Sports'
  )
on conflict do nothing;
