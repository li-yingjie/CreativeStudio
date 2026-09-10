import { useEffect, useRef } from 'react'

// Original renderer: l527497426-cyber/DOUYIN-create1, commit dec0c4109828d9b860f4ae02276089f0a83a467c.
// public/publish-flow.js: shader is unchanged.
// Adaptations: React cleanup, hover-only visibility and a gentler energy ramp.
const vertexSource = 'attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}'
const fragmentSource = `
      precision mediump float;
      varying vec2 uv;
      uniform float time,energy;
      uniform vec2 pointer;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
      float field(vec2 p){return .57*noise(p)+.28*noise(p*2.03)+.15*noise(p*4.07);}
      void main(){
        float t=time*.28;
        vec3 light=vec3(0.);
        // Far haze, middle ribbons and a closer light core move at different depths.
        for(int i=0;i<3;i++){
          float layer=float(i),depth=.3+layer*.55;
          vec2 q=uv-vec2(.08,0.)+(pointer-.5)*energy*.09*depth;
          float drift=t*(.48+layer*.27)+layer*2.1;
          float cloud=field(q*vec2(2.6,1.8)+vec2(drift*.25,layer));
          float center=.16+layer*.10+.08*sin(q.x*3.6+drift)
            +.026*sin(q.x*10.-drift*.8)+(cloud-.5)*.08;
          float distanceToLight=q.y-center;
          float spread=.23-layer*.05;
          float halo=exp(-pow(distanceToLight/(spread*2.6),2.));
          float ribbon=exp(-pow(distanceToLight/spread,2.));
          float core=exp(-pow(distanceToLight/(.016+layer*.004),2.));
          float envelope=.30+.70*exp(-pow((q.x-(.54+.16*sin(drift*.6)))/.36,2.));
          float hue=.5+.5*sin(q.x*3.7-drift*.65+layer*1.6);
          vec3 color=vec3(1.,.07,.22);
          color=mix(color,vec3(.12,.83,1.),smoothstep(.86,1.,hue)*.72);
          // Pink dominates, with a small cyan accent and no violet color stop.
          light+=envelope*color*(halo*.10+ribbon*.25+core*.12);
        }
        float mask=1.-smoothstep(.60,1.,uv.y);
        light*=mask*(.85+energy*1.05);
        vec3 mapped=vec3(1.)-exp(-light*1.5);
        float alpha=max(max(mapped.r,mapped.g),mapped.b);
        gl_FragColor=vec4(mapped/max(alpha,.001),alpha);
      }
    `

function mountPublishFlow(host: HTMLButtonElement) {
  const canvas = document.createElement('canvas')
  canvas.className = 'creator-publish-flow'
  canvas.setAttribute('aria-hidden', 'true')
  const gl = canvas.getContext('webgl', {
    alpha: true, antialias: false, depth: false, stencil: false,
    premultipliedAlpha: false, powerPreference: 'low-power',
  })
  if (!gl) return
  const shaders: WebGLShader[] = []
  const program = gl.createProgram()
  if (!program) return
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)
    if (!shader) throw Error('Publish shader allocation failed')
    shaders.push(shader)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw Error('Publish shader compilation failed')
    return shader
  }
  try {
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error('Publish shader link failed')
  } catch {
    shaders.forEach(shader => gl.deleteShader(shader))
    gl.deleteProgram(program)
    return
  }
  shaders.forEach(shader => gl.deleteShader(shader))
  gl.useProgram(program)
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
  const clock = gl.getUniformLocation(program, 'time')
  const strength = gl.getUniformLocation(program, 'energy')
  const mouse = gl.getUniformLocation(program, 'pointer')
  host.append(canvas)
  canvas.dataset.renderer = 'webgl'
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  let frame = 0, last = 0, elapsed = 0, energy = 0, hover = host.matches(':hover'), visible = true, lost = false
  let x = .5, y = .2, targetX = .5, targetY = .2
  const draw = (now: number) => {
    frame = 0
    if (lost || document.hidden || !visible) return
    const active = hover
    const delta = last ? Math.min((now-last)/1000, .1) : 0
    if (!reduced.matches && last && delta < (active ? 1/60 : 1/30)) {
      frame = requestAnimationFrame(draw)
      return
    }
    last = now
    const ease = 1-Math.exp(-delta*5)
    // Brightness and flow speed build gradually; pointer tracking stays responsive.
    const energyEase = 1-Math.exp(-delta*(active ? 4.4 : 6))
    energy += (Number(active)-energy)*energyEase
    x += (targetX-x)*ease
    y += (targetY-y)*ease
    if (!reduced.matches) elapsed += delta*(.55+energy*1.2)
    const dpr = Math.min(devicePixelRatio || 1, 2)
    const w = Math.round(host.clientWidth*dpr), h = Math.round(host.clientHeight*dpr)
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
    }
    gl.uniform1f(clock, elapsed)
    gl.uniform1f(strength, energy)
    gl.uniform2f(mouse, x, y)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
    if (!reduced.matches) frame = requestAnimationFrame(draw)
  }
  const resume = () => {
    cancelAnimationFrame(frame)
    last = 0
    frame = requestAnimationFrame(draw)
  }
  const enter = () => { hover = true; resume() }
  const leave = () => { hover = false; targetX = .5; targetY = .2 }
  const move = (event: PointerEvent) => {
    const rect = host.getBoundingClientRect()
    targetX = (event.clientX-rect.left)/rect.width
    targetY = 1-(event.clientY-rect.top)/rect.height
  }
  const contextLost = (event: Event) => {
    event.preventDefault()
    lost = true
    cancelAnimationFrame(frame)
    canvas.hidden = true
  }
  const pause = () => cancelAnimationFrame(frame)
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting
    resume()
  })
  host.addEventListener('pointerenter', enter)
  host.addEventListener('pointerleave', leave)
  host.addEventListener('pointermove', move)
  document.addEventListener('visibilitychange', resume)
  reduced.addEventListener('change', resume)
  observer.observe(host)
  canvas.addEventListener('webglcontextlost', contextLost)
  window.addEventListener('pagehide', pause)
  window.addEventListener('pageshow', resume)
  resume()
  return () => {
    pause()
    observer.disconnect()
    host.removeEventListener('pointerenter', enter)
    host.removeEventListener('pointerleave', leave)
    host.removeEventListener('pointermove', move)
    document.removeEventListener('visibilitychange', resume)
    reduced.removeEventListener('change', resume)
    canvas.removeEventListener('webglcontextlost', contextLost)
    window.removeEventListener('pagehide', pause)
    window.removeEventListener('pageshow', resume)
    gl.deleteBuffer(buffer)
    gl.deleteProgram(program)
    canvas.remove()
  }
}

export function usePublishFlow() {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (ref.current) return mountPublishFlow(ref.current)
  }, [])
  return ref
}
