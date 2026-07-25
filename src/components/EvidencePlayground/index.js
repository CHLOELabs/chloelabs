import {useEffect, useRef, useState} from 'react';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const TYPES = [
  {id: 'observation', icon: '👀', label: 'I noticed'},
  {id: 'comparison', icon: '↔', label: 'Before + after'},
  {id: 'measurement', icon: '📏', label: 'I measured'},
  {id: 'link', icon: '🔗', label: 'I made this'},
  {id: 'sketch', icon: '✎', label: 'Sketch it'},
];

export default function EvidencePlayground({artifacts = [], onChange, topic}) {
  const [type, setType] = useState('observation');
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [before, setBefore] = useState('');
  const [after, setAfter] = useState('');
  const [value, setValue] = useState(50);
  const [unit, setUnit] = useState('');
  const [url, setUrl] = useState('');
  const [draggedId, setDraggedId] = useState('');
  const [sketch, setSketch] = useState('');
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  useEffect(() => {
    if (type !== 'sketch' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.fillStyle = '#fffdf7';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#173f49';
    context.lineWidth = 5;
    context.lineCap = 'round';
  }, [type]);

  function pointerPosition(event) {
    const canvas = canvasRef.current;
    const box = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - box.left) / box.width) * canvas.width,
      y: ((event.clientY - box.top) / box.height) * canvas.height,
    };
  }

  function startDrawing(event) {
    drawing.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointerPosition(event);
    const context = canvasRef.current.getContext('2d');
    context.beginPath();
    context.moveTo(point.x, point.y);
  }

  function draw(event) {
    if (!drawing.current) return;
    const point = pointerPosition(event);
    const context = canvasRef.current.getContext('2d');
    context.lineTo(point.x, point.y);
    context.stroke();
  }

  function stopDrawing() {
    if (drawing.current && canvasRef.current) {
      setSketch(canvasRef.current.toDataURL('image/png'));
    }
    drawing.current = false;
  }

  function clearSketch() {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.fillStyle = '#fffdf7';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setSketch('');
  }

  function addArtifact() {
    if (!title.trim()) return;
    const artifact = {
      id: `evidence-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      title: title.trim(),
      detail: detail.trim(),
      before: before.trim(),
      after: after.trim(),
      value: Number(value),
      unit: unit.trim(),
      url: url.trim(),
      sketch: type === 'sketch' ? sketch : '',
      createdAt: new Date().toISOString(),
    };
    onChange([...artifacts, artifact]);
    setTitle('');
    setDetail('');
    setBefore('');
    setAfter('');
    setValue(50);
    setUnit('');
    setUrl('');
    setSketch('');
    if (type === 'sketch') clearSketch();
  }

  function remove(id) {
    if (!window.confirm('Remove this evidence card?')) return;
    onChange(artifacts.filter((artifact) => artifact.id !== id));
  }

  function move(id, direction) {
    const index = artifacts.findIndex((artifact) => artifact.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= artifacts.length) return;
    const next = [...artifacts];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function drop(targetId) {
    if (!draggedId || draggedId === targetId) return;
    const sourceIndex = artifacts.findIndex((item) => item.id === draggedId);
    const targetIndex = artifacts.findIndex((item) => item.id === targetId);
    const next = [...artifacts];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    onChange(next);
    setDraggedId('');
  }

  const canAdd =
    title.trim() &&
    (type !== 'sketch' || sketch) &&
    (type !== 'link' || validUrl(url));

  return (
    <section className={styles.playground}>
      <div className={styles.heading}>
        <div>
          <span>Evidence Playground</span>
          <Heading as="h2">Can you prove what happened?</Heading>
          <p>Make a card for something you saw, measured, changed, or made.</p>
        </div>
        <div className={styles.cardCount}>
          <strong>{artifacts.length}</strong>
          <small>{artifacts.length === 1 ? 'artifact' : 'artifacts'}</small>
        </div>
      </div>

      <div className={styles.typeRail} aria-label="Choose evidence type">
        {TYPES.map((item) => (
          <button
            aria-pressed={type === item.id}
            className={type === item.id ? styles.typeSelected : ''}
            key={item.id}
            onClick={() => setType(item.id)}
            type="button">
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className={styles.maker}>
        <div className={styles.inputs}>
          <label>
            Give this evidence a short name
            <input
              maxLength={80}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={titlePlaceholder(type, topic)}
              value={title}
            />
          </label>

          {type === 'comparison' && (
            <div className={styles.twoInputs}>
              <label>
                Before
                <input
                  maxLength={120}
                  onChange={(event) => setBefore(event.target.value)}
                  placeholder="My first version…"
                  value={before}
                />
              </label>
              <label>
                After
                <input
                  maxLength={120}
                  onChange={(event) => setAfter(event.target.value)}
                  placeholder="After I changed…"
                  value={after}
                />
              </label>
            </div>
          )}

          {type === 'measurement' && (
            <div className={styles.measureControls}>
              <label>
                Value: <strong>{value}</strong>
                <input
                  max="100"
                  min="0"
                  onChange={(event) => setValue(event.target.value)}
                  type="range"
                  value={value}
                />
              </label>
              <label>
                Unit or label
                <input
                  maxLength={30}
                  onChange={(event) => setUnit(event.target.value)}
                  placeholder="cm, seconds, points…"
                  value={unit}
                />
              </label>
            </div>
          )}

          {type === 'link' && (
            <label>
              Link to code, a video, or something you made
              <input
                inputMode="url"
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://…"
                type="url"
                value={url}
              />
            </label>
          )}

          {type === 'sketch' && (
            <div>
              <canvas
                aria-label="Draw a simple evidence sketch"
                className={styles.canvas}
                height="300"
                onPointerCancel={stopDrawing}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                ref={canvasRef}
                width="600"
              />
              <button
                className={styles.clearButton}
                onClick={clearSketch}
                type="button">
                Clear sketch
              </button>
            </div>
          )}

          <label>
            What does it show?
            <textarea
              maxLength={400}
              onChange={(event) => setDetail(event.target.value)}
              placeholder="I noticed… / This changed because…"
              rows={3}
              value={detail}
            />
          </label>
          <button
            className="button button--primary button--lg"
            disabled={!canAdd}
            onClick={addArtifact}
            type="button">
            Add it to my evidence board
          </button>
        </div>

        <LivePreview
          after={after}
          before={before}
          detail={detail}
          sketch={sketch}
          title={title}
          type={type}
          unit={unit}
          url={url}
          value={value}
        />
      </div>

      {artifacts.length ? (
        <div className={styles.board}>
          <div className={styles.boardHeading}>
            <strong>My evidence board</strong>
            <small>Drag cards—or use the arrows—to put them in story order.</small>
          </div>
          <div className={styles.cards}>
            {artifacts.map((artifact, index) => (
              <article
                className={styles.artifact}
                draggable
                key={artifact.id}
                onDragOver={(event) => event.preventDefault()}
                onDragStart={() => setDraggedId(artifact.id)}
                onDrop={() => drop(artifact.id)}>
                <span className={styles.artifactIcon}>
                  {TYPES.find((item) => item.id === artifact.type)?.icon}
                </span>
                <small>{TYPES.find((item) => item.id === artifact.type)?.label}</small>
                <Heading as="h3">{artifact.title}</Heading>
                <ArtifactVisual artifact={artifact} />
                {artifact.detail && <p>{artifact.detail}</p>}
                <div className={styles.cardActions}>
                  <button
                    disabled={index === 0}
                    onClick={() => move(artifact.id, -1)}
                    type="button"
                    aria-label={`Move ${artifact.title} earlier`}>
                    ←
                  </button>
                  <button
                    disabled={index === artifacts.length - 1}
                    onClick={() => move(artifact.id, 1)}
                    type="button"
                    aria-label={`Move ${artifact.title} later`}>
                    →
                  </button>
                  <button onClick={() => remove(artifact.id)} type="button">
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.emptyBoard}>
          <span aria-hidden="true">◇</span>
          <p>Your first evidence card will appear here instantly.</p>
        </div>
      )}
    </section>
  );
}

function LivePreview({after, before, detail, sketch, title, type, unit, url, value}) {
  return (
    <aside className={styles.preview} aria-live="polite">
      <span>LIVE PREVIEW</span>
      <strong>{title || 'Your evidence card'}</strong>
      {type === 'comparison' && (
        <div className={styles.comparison}>
          <div><small>BEFORE</small><p>{before || 'First try'}</p></div>
          <b>→</b>
          <div><small>AFTER</small><p>{after || 'Next try'}</p></div>
        </div>
      )}
      {type === 'measurement' && (
        <div className={styles.gauge}>
          <i style={{width: `${value}%`}} />
          <b>{value} {unit}</b>
        </div>
      )}
      {type === 'link' && <div className={styles.linkPreview}>🔗 {url || 'Your link'}</div>}
      {type === 'sketch' && sketch && <img alt="" src={sketch} />}
      {type === 'observation' && <div className={styles.bigEye}>👀</div>}
      <p>{detail || 'Describe what this proves.'}</p>
    </aside>
  );
}

function ArtifactVisual({artifact}) {
  if (artifact.type === 'comparison') {
    return <div className={styles.miniCompare}><span>{artifact.before || 'Before'}</span><b>→</b><span>{artifact.after || 'After'}</span></div>;
  }
  if (artifact.type === 'measurement') {
    return <div className={styles.miniGauge}><i style={{width: `${artifact.value}%`}}/><strong>{artifact.value} {artifact.unit}</strong></div>;
  }
  if (artifact.type === 'sketch' && artifact.sketch) {
    return <img className={styles.sketchImage} alt={`Sketch: ${artifact.title}`} src={artifact.sketch}/>;
  }
  if (artifact.type === 'link' && validUrl(artifact.url)) {
    return <a href={artifact.url} rel="noreferrer" target="_blank">Open my artifact ↗</a>;
  }
  return null;
}

function titlePlaceholder(type, topic) {
  return {
    observation: `Something I noticed about ${topic}`,
    comparison: 'How my second try changed',
    measurement: 'My best measurement',
    link: 'What I made',
    sketch: 'My design sketch',
  }[type];
}

function validUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}
