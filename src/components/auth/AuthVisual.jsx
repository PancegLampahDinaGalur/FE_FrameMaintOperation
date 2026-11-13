import React, { useEffect, useState } from "react";

const loginSlides = Array.from(
  { length: 8 },
  (_, index) => `/images/login/login-${String(index + 1).padStart(2, "0")}.jpg`,
);

export function AuthVisual() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % loginSlides.length);
    }, 3000);

    return () => window.clearInterval(timerId);
  }, []);

  return (
    <>
      <div className="login-background" aria-hidden="true">
        {loginSlides.map((image, index) => (
          <img
            className={`login-background-slide ${index === activeSlide ? "is-active" : ""}`}
            src={image}
            alt=""
            key={image}
          />
        ))}
      </div>
      <div className="login-background-overlay" aria-hidden="true" />

      <section className="login-hero" aria-label="Frame MaintOps">
        <a className="login-brand" href="/" aria-label="Frame MaintOps home">
          <span className="login-brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="login-brand-copy">
            <strong>
              Frame<span>Maint</span>
            </strong>
            <small>OPERATIONS PLATFORM</small>
          </span>
        </a>

        <div className="login-hero-copy">
          <span className="login-eyebrow">TEAMWORK IN EVERY DETAIL</span>
          <h1>Maintenance runs better when everything works together.</h1>
          <p>
            Keep your people, attendance, and maintenance work moving in one
            place.
          </p>
        </div>

        <div className="login-slide-controls" aria-label="Background slides">
          <span>
            {String(activeSlide + 1).padStart(2, "0")}
            <i />
            {String(loginSlides.length).padStart(2, "0")}
          </span>
          <div>
            {loginSlides.map((image, index) => (
              <button
                type="button"
                className={index === activeSlide ? "is-active" : ""}
                aria-label={`Show background ${index + 1}`}
                aria-pressed={index === activeSlide}
                onClick={() => setActiveSlide(index)}
                key={image}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
