import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../style/landing.css';

// Pre-defined nodes for visual playground
const INITIAL_NODES = [
  { id: 'you', x: 200, y: 150, vx: 0.2, vy: -0.2, radius: 26, label: 'You (Hub)', color: '#6366f1', isHub: true },
  { id: 'diya', x: 80, y: 100, vx: -0.4, vy: 0.3, radius: 18, label: 'Diya', color: '#ec4899' },
  { id: 'trisha', x: 320, y: 90, vx: 0.5, vy: -0.4, radius: 18, label: 'Trisha', color: '#10b981' },
  { id: 'meet', x: 120, y: 220, vx: 0.3, vy: -0.5, radius: 18, label: 'Meet', color: '#f59e0b' },
  { id: 'harsh', x: 280, y: 230, vx: -0.5, vy: 0.4, radius: 18, label: 'Harsh', color: '#06b6d4' }
];

function Landing() {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [nodeInput, setNodeInput] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const testimonials = [
    { quote: "Make My Circle has completely changed how our development team stays connected. The verification is flawless.", author: "Sarah Jenkins", role: "Product Manager" },
    { quote: "The AI companion feature is extremely helpful. I can brainstorm and chat in the same unified interface.", author: "Rajesh Patel", role: "Software Engineer" },
    { quote: "Minimal, fast, and completely secure. It is exactly what a chat workspace should feel like.", author: "Elena Rostova", role: "UI Designer" }
  ];

  const faqs = [
    { q: "How does mutual follow verification work?", a: "To prevent spam and unsolicited messages, users can only chat with each other once they both mutually follow each other. This creates a secure, trusted circle." },
    { q: "What is the Custom AI Companion?", a: "It is an integrated AI assistant that you can chat with directly inside the app to help answer questions, brainstorm, debug code, or draft articles in real-time." },
    { q: "Is my profile data and upload secure?", a: "Yes, all uploaded pictures and messages are strictly isolated and authorized through JWT tokens, ensuring your data is accessible only by your connections." }
  ];

  // Interactive Node Connection Spawner
  const handleAddNode = (e) => {
    e.preventDefault();
    if (!nodeInput.trim()) return;

    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 400;
    const height = canvas ? canvas.height : 300;

    const colors = ['#f43f5e', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newNode = {
      id: `node-${Date.now()}`,
      x: Math.random() * (width - 60) + 30,
      y: Math.random() * (height - 60) + 30,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      radius: 18,
      label: nodeInput.trim(),
      color: randomColor
    };

    setNodes((prev) => [...prev, newNode]);
    setNodeInput('');
  };

  const handleResetNodes = () => {
    setNodes(INITIAL_NODES);
  };

  // Canvas Physics and Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      // Clear Canvas with subtle grid structure
      ctx.fillStyle = '#1e293b'; // Slate 800 background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw faint connection grid dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let i = 0; i < canvas.width; i += 20) {
        for (let j = 0; j < canvas.height; j += 20) {
          ctx.fillRect(i, j, 2, 2);
        }
      }

      // Draw connection lines
      ctx.lineWidth = 1.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];

          // Hub connections are solid, other nodes are distance-based
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
          if (n1.isHub || n2.isHub) {
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          } else if (dist < 150) {
            // Draw secondary links with gradient opacity
            const opacity = (1 - dist / 150) * 0.15;
            ctx.strokeStyle = `rgba(226, 232, 240, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      // Update positions and draw nodes
      nodes.forEach((node) => {
        // Move nodes
        node.x += node.vx;
        node.y += node.vy;

        // Wall collision
        if (node.x - node.radius < 0 || node.x + node.radius > canvas.width) {
          node.vx *= -1;
          node.x = node.x - node.radius < 0 ? node.radius : canvas.width - node.radius;
        }
        if (node.y - node.radius < 0 || node.y + node.radius > canvas.height) {
          node.vy *= -1;
          node.y = node.y - node.radius < 0 ? node.radius : canvas.height - node.radius;
        }

        // Draw shadow glow
        ctx.shadowBlur = 12;
        ctx.shadowColor = node.color;

        // Draw Node circle
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw Node border
        ctx.shadowBlur = 0; // Reset shadow for stroke
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Node label text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + 4);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodes]);

  return (
    <div className="pro-landing-page">
      
      {/* 1. Header Navigation Bar */}
      <header className="pro-header">
        <div className="pro-header-container">
          <div className="pro-brand">
            Make My <span>Circle</span>
          </div>
          <nav className="pro-nav-links">
            <a href="#features">Features</a>
            <a href="#visualizer">Connection Tool</a>
            <a href="#testimonials">Reviews</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="pro-auth-actions">
            <Link to="/login" className="pro-btn-text">Log In</Link>
            <Link to="/register" className="pro-btn pro-btn-primary">Register</Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Presentation Section */}
      <section className="pro-hero-section">
        <div className="pro-hero-container">
          <div className="pro-hero-text">
            <div className="pro-pill">Now Live: Secure Mutual Messaging</div>
            <h1>Connect Your Circles. Expand Your World.</h1>
            <p>
              A premium, verified space for communication. Connect with your friends, 
              network, and access an advanced, direct-response AI Companion.
            </p>
            <div className="pro-hero-buttons">
              <Link to="/register" className="pro-btn pro-btn-lg pro-btn-gradient">Get Started Free</Link>
              <a href="#features" className="pro-btn pro-btn-lg pro-btn-outline">Learn Features</a>
            </div>
          </div>
          <div className="pro-hero-visual">
            <div className="glass-dashboard-card">
              <div className="dashboard-header-mock">
                <span className="dot-mock"></span>
                <span className="dot-mock"></span>
                <span className="dot-mock"></span>
              </div>
              <div className="dashboard-body-mock">
                <div className="mock-sidebar">
                  <div className="mock-logo"></div>
                  <div className="mock-item active"></div>
                  <div className="mock-item"></div>
                  <div className="mock-item"></div>
                </div>
                <div className="mock-main">
                  <div className="mock-top"></div>
                  <div className="mock-bubbles">
                    <div className="bubble-mock left">Welcome! How can I help?</div>
                    <div className="bubble-mock right">Connect me with Trisha.</div>
                    <div className="bubble-mock left active">Connecting you now...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Cards Grid */}
      <section id="features" className="pro-features-section">
        <div className="section-title-wrap">
          <h2>Why Professionals Choose Our Workspace</h2>
          <p>Designed for clarity, security, and smart features.</p>
        </div>
        <div className="pro-features-grid">
          <div className="feature-item-card">
            <div className="feature-icon">🔒</div>
            <h3>Verified Mutual Connections</h3>
            <p>Chat only with connections who mutually approve each other, keeping spam and noise completely out.</p>
          </div>
          <div className="feature-item-card">
            <div className="feature-icon">⚡</div>
            <h3>Direct Response AI Companion</h3>
            <p>Engage with our custom-trained AI assistant directly from your sidebar to speed up tasks, brainstorm, or write.</p>
          </div>
          <div className="feature-item-card">
            <div className="feature-icon">📱</div>
            <h3>Fluid Responsive Layout</h3>
            <p>Chat on-the-go with modular layout panels designed to respond beautifully on desktop, tablet, and mobile views.</p>
          </div>
          <div className="feature-item-card">
            <div className="feature-icon">✨</div>
            <h3>Premium Aesthetics</h3>
            <p>Leverages ultra-modern glassmorphic panels, rich shadows, and fluid animations for a stunning experience.</p>
          </div>
        </div>
      </section>

      {/* 4. Connection Visualizer Plugin Section */}
      <section id="visualizer" className="pro-visualizer-section">
        <div className="pro-visualizer-container">
          <div className="visualizer-intro">
            <h2>Visual Circle Visualizer Plugin</h2>
            <p>
              Experience how our platform verifies and links users. Type a name to add a 
              node to the canvas, and watch it connect dynamically to your verified social circle.
            </p>
            <form onSubmit={handleAddNode} className="visualizer-form">
              <input
                value={nodeInput}
                onChange={(e) => setNodeInput(e.target.value)}
                placeholder="Enter connection name..."
                maxLength="12"
              />
              <button type="submit" className="pro-btn pro-btn-primary">Connect +</button>
            </form>
            <button onClick={handleResetNodes} className="pro-btn-reset">Reset Network</button>
          </div>

          <div className="visualizer-canvas-panel">
            <canvas 
              ref={canvasRef} 
              width={480} 
              height={320} 
              className="connection-canvas"
            />
            <span className="canvas-footnote">Interactive Canvas Node Playground (Real-time Physics)</span>
          </div>
        </div>
      </section>

      {/* 5. Testimonial Carousel */}
      <section id="testimonials" className="pro-testimonials-section">
        <div className="testimonials-card">
          <div className="testimonial-quote">
            "{testimonials[testimonialIndex].quote}"
          </div>
          <div className="testimonial-meta">
            <strong>{testimonials[testimonialIndex].author}</strong>
            <span>{testimonials[testimonialIndex].role}</span>
          </div>
          <div className="testimonial-dots">
            {testimonials.map((_, i) => (
              <span 
                key={i} 
                className={`dot ${i === testimonialIndex ? 'active' : ''}`}
                onClick={() => setTestimonialIndex(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Interactive FAQ Accordion */}
      <section id="faq" className="pro-faq-section">
        <div className="section-title-wrap">
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about Make My Circle.</p>
        </div>
        <div className="faq-accordion-list">
          {faqs.map((faq, i) => (
            <div key={i} className={`faq-item ${activeFaq === i ? 'open' : ''}`}>
              <button className="faq-question-btn" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                <span>{faq.q}</span>
                <span className="faq-icon-arrow">{activeFaq === i ? '−' : '+'}</span>
              </button>
              <div className="faq-answer-panel">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="pro-footer">
        <div className="pro-footer-container">
          <div className="footer-brand">Make My Circle</div>
          <p>© {new Date().getFullYear()} Make My Circle. All rights reserved. Connecting circles professionally.</p>
        </div>
      </footer>

    </div>
  );
}

export default Landing;