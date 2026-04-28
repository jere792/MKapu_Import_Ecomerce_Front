"use client";
import { useEffect, useState } from "react";
import { getVideos, Video } from "@/lib/queries";

export default function VideoSection({ tipo }: { tipo?: "video" | "vlog" }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [active, setActive] = useState<Video | null>(null);

  useEffect(() => {
    getVideos(tipo).then((data) => {
      setVideos(data);
      if (data.length > 0) setActive(data[0]);
    });
  }, [tipo]);

  if (videos.length === 0) return null;

  return (
    <section className="vs-section">
      <div className="vs-inner">
        <div className="vs-head">
          <span className="vs-tag">{tipo === "vlog" ? "Vlog" : "Videos"}</span>
          <h2 className="vs-title">{tipo === "vlog" ? "Nuestro Vlog" : "Videos destacados"}</h2>
        </div>

        <div className="vs-layout">
          <div className="vs-player">
            {active?.youtube_id ? (
              <iframe
                src={`https://www.youtube.com/embed/${active.youtube_id}?autoplay=0&rel=0`}
                title={active.title}
                allowFullScreen
                className="vs-iframe"
              />
            ) : active?.video_url ? (
              <video src={active.video_url} controls className="vs-iframe" />
            ) : null}
            {active && (
              <div className="vs-player-info">
                <h3 className="vs-player-title">{active.title}</h3>
                {active.descripcion && (
                  <p className="vs-player-desc">{active.descripcion}</p>
                )}
              </div>
            )}
          </div>

          <div className="vs-list">
            {videos.map((v) => (
              <button
                key={v.id}
                onClick={() => setActive(v)}
                className={`vs-item${active?.id === v.id ? " vs-item--active" : ""}`}
              >
                <div className="vs-thumb">
                  {v.thumbnail ? (
                    <img src={v.thumbnail} alt={v.title} className="vs-thumb-img" />
                  ) : v.youtube_id ? (
                    <img
                      src={`https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`}
                      alt={v.title}
                      className="vs-thumb-img"
                    />
                  ) : (
                    <div className="vs-thumb-placeholder">▶</div>
                  )}
                </div>
                <div className="vs-item-info">
                  <p className="vs-item-title">{v.title}</p>
                  {v.descripcion && (
                    <p className="vs-item-desc">{v.descripcion}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .vs-section {
          padding: 4rem 1.5rem;
          background: #0d0d0d;
        }
        .vs-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .vs-head {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .vs-tag {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #f5a623;
          margin-bottom: 0.5rem;
        }
        .vs-title {
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 900;
          color: #fff;
          margin: 0;
        }
        .vs-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 1.5rem;
          align-items: start;
        }
        .vs-player {
          background: #111;
          border-radius: 12px;
          overflow: hidden;
        }
        .vs-iframe {
          width: 100%;
          aspect-ratio: 16/9;
          border: none;
          display: block;
        }
        .vs-player-info {
          padding: 1rem 1.25rem;
        }
        .vs-player-title {
          font-size: 1rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.5rem;
        }
        .vs-player-desc {
          font-size: 0.85rem;
          color: #888;
          margin: 0;
          line-height: 1.5;
        }
        .vs-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 480px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #333 transparent;
        }
        .vs-item {
          display: flex;
          gap: 0.75rem;
          background: #111;
          border: 1.5px solid transparent;
          border-radius: 10px;
          padding: 0.6rem;
          cursor: pointer;
          text-align: left;
          transition: border-color 0.15s, background 0.15s;
        }
        .vs-item:hover {
          background: #1a1a1a;
        }
        .vs-item--active {
          border-color: #f5a623;
          background: #1a1a1a;
        }
        .vs-thumb {
          width: 90px;
          height: 56px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
          background: #222;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vs-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .vs-thumb-placeholder {
          font-size: 1.2rem;
          color: #555;
        }
        .vs-item-info {
          flex: 1;
          min-width: 0;
        }
        .vs-item-title {
          font-size: 0.82rem;
          font-weight: 600;
          color: #fff;
          margin: 0 0 4px;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .vs-item-desc {
          font-size: 0.75rem;
          color: #666;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @media (max-width: 768px) {
          .vs-layout {
            grid-template-columns: 1fr;
          }
          .vs-list {
            max-height: 300px;
          }
        }
      `}</style>
    </section>
  );
}