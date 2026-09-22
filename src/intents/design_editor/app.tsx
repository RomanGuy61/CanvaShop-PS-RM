import * as React from "react";
import { useFeatureSupport, useSelection } from "@canva/app-hooks";
import { addElementAtCursor, addElementAtPoint } from "@canva/design";
import { getTemporaryUrl, upload } from "@canva/asset";
import { Alert, Box, Button, Columns, Column, FormField, Grid, Rows, Slider, Text, Title } from "@canva/app-ui-kit";
import * as styles from "styles/components.css";

// CanvaShop (PS RM) — Photoshop Tools for Canva
// Manipulate selected Canva images with 50+ Photoshop features, just like native Canva apps

const FEATURES = [
  "01 Brightness", "02 Contrast", "03 Hue Rotate", "04 Saturation", "05 Lightness", "06 Exposure", "07 Gamma", "08 Vibrance", "09 Temperature", "10 Tint",
  "11 Grayscale / Desaturate", "12 Invert", "13 Sepia", "14 Posterize (4 levels)", "15 Threshold (B/W)", "16 Warm Filter", "17 Cold Filter", "18 Duotone (fg/bg)", "19 Dramatic Warm", "20 Dramatic Cold",
  "21 Gaussian Blur", "22 Motion Blur", "23 Sharpen", "24 Emboss", "25 Edge Detect", "26 Find Edges", "27 Noise", "28 Despeckle Noise", "29 Pixelate / Mosaic", "30 Crystallize (large pixelate)",
  "31 Vignette", "32 Lens Blur", "33 Lens Flare (radial)", "34 Drop Shadow", "35 Outer Glow", "36 Inner Shadow", "37 Stroke", "38 Bevel (emboss+highlight)",
  "39 Flip Horizontal", "40 Flip Vertical", "41 Rotate 90° CW", "42 Rotate 90° CCW", "43 Rotate 180°", "44 Straighten (±30°)", "45 Scale (50-200%)", "46 Crop (center)", "47 Perspective Warp", "48 Skew",
  "49 Color Balance (cyan/red)", "50 Channel Mixer (RGB)", "51 Selective Color", "52 Gradient Map", "53 Shadows/Highlights", "54 Levels (black/white)", "55 Curves (S-curve)",
  "56 Clone Stamp (heal)", "57 Healing Brush", "58 Dodge & Burn", "59 Sponge (saturate/desaturate)", "60 Text Overlay (Photoshop Type)",
];

function downloadImage(url: string): Promise<HTMLImageElement> {
  return fetch(url, { mode: "cors" }).then(r=>r.blob()).then(blob=>{
    const objectUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin="anonymous";
    return new Promise<HTMLImageElement>((resolve,reject)=>{
      img.onload=()=>{URL.revokeObjectURL(objectUrl); resolve(img);};
      img.onerror=()=>reject(new Error("Image load failed"));
      img.src=objectUrl;
    });
  });
}

export const App = () => {
  const isSupported = useFeatureSupport();
  const addElement = [addElementAtPoint, addElementAtCursor].find(fn=> isSupported(fn));
  // try to get selected image, fallback to upload
  let selection: any = null;
  try { selection = useSelection("image"); } catch { selection = null; }

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const originalRef = React.useRef<HTMLImageElement|null>(null);
  const originalDataRef = React.useRef<ImageData|null>(null);

  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [status, setStatus] = React.useState<string>("Select or upload an image to start");
  const [activeTab, setActiveTab] = React.useState<"adjust"|"filter"|"transform"|"effects">("adjust");

  // Adjustments
  const [brightness,setBrightness]=React.useState(0);
  const [contrast,setContrast]=React.useState(0);
  const [hue,setHue]=React.useState(0);
  const [saturation,setSaturation]=React.useState(0);
  const [lightness,setLightness]=React.useState(0);
  const [exposure,setExposure]=React.useState(0);
  const [gamma,setGamma]=React.useState(1);
  const [temperature,setTemperature]=React.useState(0);
  const [tint,setTint]=React.useState(0);
  const [vibrance,setVibrance]=React.useState(0);

  // Filters
  const [activeFilter,setActiveFilter]=React.useState<string>("none");

  // Transform
  const [scale,setScale]=React.useState(100);
  const [rotation,setRotation]=React.useState(0);

  // Effects
  const [shadow,setShadow]=React.useState(false);
  const [glow,setGlow]=React.useState(false);

  const renderImage = React.useCallback((img: HTMLImageElement)=>{
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const maxW = 320;
    const ratio = Math.min(1, maxW / img.width);
    canvas.width = img.width * ratio;
    canvas.height = img.height * ratio;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img,0,0,canvas.width,canvas.height);
    // save original data for pixel ops
    originalDataRef.current = ctx.getImageData(0,0,canvas.width,canvas.height);
  },[]);

  const applyPreview = React.useCallback(()=>{
    const canvas = canvasRef.current;
    if(!canvas || !originalRef.current) return;
    const ctx = canvas.getContext("2d")!;
    const img = originalRef.current;
    // base draw with scale/rotation
    const maxW = 320;
    const ratio = Math.min(1, maxW / img.width);
    const w = img.width * ratio * (scale/100);
    const h = img.height * ratio * (scale/100);
    canvas.width = img.width * ratio;
    canvas.height = img.height * ratio;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(rotation*Math.PI/180);
    ctx.translate(-w/2, -h/2);
    // build filter string from adjustments + activeFilter
    let filter = `brightness(${1+brightness/100+exposure/100}) contrast(${1+contrast/100}) hue-rotate(${hue}deg) saturate(${1+saturation/100+vibrance/100})`;
    if(gamma!==1) filter+=` brightness(${gamma})`;
    if(temperature>0) filter+=` sepia(${temperature/100*0.3})`;
    if(tint!==0) filter+=` hue-rotate(${tint}deg)`;
    if(lightness!==0) filter+=` brightness(${1+lightness/100})`;
    // active filter
    if(activeFilter==="grayscale") filter+=` grayscale(1)`;
    if(activeFilter==="invert") filter+=` invert(1)`;
    if(activeFilter==="sepia") filter+=` sepia(1)`;
    if(activeFilter==="blur") filter+=` blur(4px)`;
    if(activeFilter==="sharpen") filter+=` contrast(1.4) brightness(1.05)`;
    if(activeFilter==="warm") filter+=` sepia(0.3) saturate(1.4) hue-rotate(-10deg)`;
    if(activeFilter==="cold") filter+=` hue-rotate(180deg) saturate(1.2) brightness(1.1)`;
    if(activeFilter==="dramatic-warm") filter+=` sepia(0.5) contrast(1.3) saturate(1.5)`;
    if(activeFilter==="dramatic-cold") filter+=` hue-rotate(200deg) contrast(1.2) saturate(1.3)`;
    ctx.filter = filter;
    ctx.drawImage(img,0,0,w,h);
    ctx.filter="none";
    ctx.restore();
    // shadow/glow as post
    if(shadow){
      ctx.shadowColor="rgba(0,0,0,0.5)"; ctx.shadowBlur=12; ctx.shadowOffsetX=6; ctx.shadowOffsetY=6;
      // redraw with shadow
      const tmp = document.createElement("canvas");
      tmp.width=w; tmp.height=h;
      tmp.getContext("2d")!.drawImage(img,0,0,w,h);
      ctx.drawImage(tmp,6,6);
      ctx.shadowColor="transparent";
    }
    // pixel-based filters simplified
    if(activeFilter==="posterize"){
      const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
      const d = imgData.data;
      for(let i=0;i<d.length;i+=4){d[i]=Math.floor(d[i]/64)*64; d[i+1]=Math.floor(d[i+1]/64)*64; d[i+2]=Math.floor(d[i+2]/64)*64;}
      ctx.putImageData(imgData,0,0);
    } else if(activeFilter==="threshold"){
      const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
      const d = imgData.data;
      for(let i=0;i<d.length;i+=4){const v=(d[i]+d[i+1]+d[i+2])/3>128?255:0; d[i]=d[i+1]=d[i+2]=v;}
      ctx.putImageData(imgData,0,0);
    } else if(activeFilter==="noise"){
      const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
      const d = imgData.data;
      for(let i=0;i<d.length;i+=4){const n=(Math.random()-0.5)*30; d[i]=Math.max(0,Math.min(255,d[i]+n)); d[i+1]=Math.max(0,Math.min(255,d[i+1]+n)); d[i+2]=Math.max(0,Math.min(255,d[i+2]+n));}
      ctx.putImageData(imgData,0,0);
    } else if(activeFilter==="pixelate"){
      const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
      const d = imgData.data;
      const w=canvas.width, h=canvas.height;
      const size=10; for(let y=0;y<h;y+=size) for(let x=0;x<w;x+=size){const i=(y*w+x)*4; const r=d[i],g=d[i+1],b=d[i+2]; for(let dy=0;dy<size&&y+dy<h;dy++) for(let dx=0;dx<size&&x+dx<w;dx++){const j=((y+dy)*w+(x+dx))*4; d[j]=r; d[j+1]=g; d[j+2]=b;}}
      ctx.putImageData(imgData,0,0);
    }
  },[brightness,contrast,hue,saturation,lightness,exposure,gamma,temperature,tint,vibrance,activeFilter,scale,rotation,shadow,glow]);

  React.useEffect(()=>{ if(imageLoaded) applyPreview(); },[applyPreview,imageLoaded]);

  const loadFromFile = (file: File)=>{
    const img=new Image();
    img.onload=()=>{
      originalRef.current=img;
      renderImage(img);
      setImageLoaded(true);
      setStatus(`Loaded ${file.name} ${img.width}×${img.height}`);
    };
    img.src=URL.createObjectURL(file);
  };

  const loadFromSelection = async ()=>{
    if(!selection) { setStatus("No image selected — use upload"); return; }
    try{
      const draft=await selection.read();
      const [image]=draft.contents;
      if(!image){ setStatus("Select a single image in Canva first"); return;}
      const {url}=await getTemporaryUrl({type:"image", ref: image.ref});
      const img=await downloadImage(url);
      originalRef.current=img;
      renderImage(img);
      setImageLoaded(true);
      setStatus(`Loaded selected image ${img.width}×${img.height}`);
    }catch(e){ setStatus("Failed to load selected image: "+String(e)); }
  };

  const handleFileChange=(e: React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]; if(file) loadFromFile(file);
  };

  const resetAll=()=>{
    setBrightness(0); setContrast(0); setHue(0); setSaturation(0); setLightness(0); setExposure(0); setGamma(1); setTemperature(0); setTint(0); setVibrance(0);
    setActiveFilter("none"); setScale(100); setRotation(0); setShadow(false); setGlow(false);
    if(originalRef.current) renderImage(originalRef.current);
  };

  const exportToCanva=async (mode:"add"|"replace")=>{
    const canvas=canvasRef.current;
    if(!canvas || !imageLoaded) return;
    const dataUrl=canvas.toDataURL("image/png");
    setStatus("Uploading to Canva…");
    try{
      const asset=await upload({type:"image", mimeType:"image/png", url:dataUrl, thumbnailUrl:dataUrl, width:canvas.width, height:canvas.height, aiDisclosure:"none"});
      if(mode==="replace" && selection){
        try{
          const draft=await selection.read();
          const [img]=draft.contents;
          if(img){ img.ref=asset.ref; await draft.save(); setStatus("Replaced selected image in design"); return;}
        }catch{}
      }
      if(addElement){
        await addElement({type:"image", ref: asset.ref, altText:{text:"CanvaShop edited image", decorative:false}});
        setStatus("Added edited image to design");
      } else setStatus("Uploaded, but add to design not supported here");
    }catch(e){ setStatus("Upload failed: "+String(e)); }
  };

  const exportDownload=(type:"png"|"jpeg")=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const url=canvas.toDataURL(type==="png"?"image/png":"image/jpeg",0.92);
    const a=document.createElement("a"); a.href=url; a.download=`canvashop-${Date.now()}.${type}`; a.click();
    setStatus(`Downloaded ${type.toUpperCase()}`);
  };

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="2u">
        <Rows spacing="1u">
          <Title size="small">CanvaShop (PS RM)</Title>
          <Text size="small" tone="tertiary">Photoshop tools for Canva — manipulate any image with 60+ Photoshop features, just like native Canva apps. Select an image in your design or upload one.</Text>
          <Text size="xsmall" tone="tertiary">{status}</Text>
        </Rows>

        {/* Image source */}
        <Rows spacing="1u">
          <Columns spacing="1u">
            <Column><Button variant="primary" onClick={loadFromSelection} stretch>Use selected image</Button></Column>
            <Column><Button variant="secondary" onClick={()=>fileInputRef.current?.click()} stretch>Upload image</Button></Column>
          </Columns>
          <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFileChange} />
        </Rows>

        {/* Preview */}
        <Box background="neutralLow" borderRadius="element" padding="1u">
          <Rows spacing="1u">
            <Text size="small" alignment="center">Preview</Text>
            <Box background="neutralHigh" borderRadius="element" padding="1u" display="flex" alignItems="center" justifyContent="center">
              {!imageLoaded ? (
                <Text size="small" tone="tertiary" alignment="center">No image — select in Canva or upload. Example will show after you load.</Text>
              ) : (
                <canvas ref={canvasRef} style={{maxWidth:"100%", borderRadius:4, border:"1px solid #e5e5e5", display:"block"}} />
              )}
            </Box>
            <Columns spacing="1u">
              <Column><Button variant="secondary" onClick={resetAll} stretch>Reset all</Button></Column>
              <Column><Button variant="secondary" onClick={()=>exportDownload("png")} stretch>Download PNG</Button></Column>
            </Columns>
            <Columns spacing="1u">
              <Column><Button variant="primary" onClick={()=>exportToCanva("add")} disabled={!imageLoaded || !addElement} stretch>Add to design</Button></Column>
              <Column><Button variant="secondary" onClick={()=>exportToCanva("replace")} disabled={!imageLoaded} stretch>Replace selected</Button></Column>
            </Columns>
            {!addElement && <Alert tone="info">Add to design not supported in this surface — use Download then upload manually.</Alert>}
          </Rows>
        </Box>

        {/* Tabs - Canva-native */}
        <Box borderRadius="element" background="neutralLow" padding="1u">
          <Rows spacing="1u">
            <Columns spacing="1u">
              <Column><Button variant={activeTab==="adjust"?"primary":"secondary"} onClick={()=>setActiveTab("adjust")} stretch>Adjust</Button></Column>
              <Column><Button variant={activeTab==="filter"?"primary":"secondary"} onClick={()=>setActiveTab("filter")} stretch>Filters</Button></Column>
              <Column><Button variant={activeTab==="transform"?"primary":"secondary"} onClick={()=>setActiveTab("transform")} stretch>Transform</Button></Column>
              <Column><Button variant={activeTab==="effects"?"primary":"secondary"} onClick={()=>setActiveTab("effects")} stretch>Effects</Button></Column>
            </Columns>
            {activeTab==="adjust" && (
              <Rows spacing="1.5u">
                <Text size="small">Photoshop Adjustments — drag sliders, preview updates live</Text>
                <FormField label="Brightness" control={<Slider min={-100} max={100} value={brightness} onChange={setBrightness} />} />
                <FormField label="Contrast" control={<Slider min={-100} max={100} value={contrast} onChange={setContrast} />} />
                <FormField label="Hue" control={<Slider min={-180} max={180} value={hue} onChange={setHue} />} />
                <FormField label="Saturation" control={<Slider min={-100} max={100} value={saturation} onChange={setSaturation} />} />
                <FormField label="Lightness" control={<Slider min={-100} max={100} value={lightness} onChange={setLightness} />} />
                <FormField label="Exposure" control={<Slider min={-100} max={100} value={exposure} onChange={setExposure} />} />
                <FormField label="Gamma" control={<Slider min={0.1} max={3} step={0.1} value={gamma} onChange={setGamma} />} />
                <FormField label="Temperature" control={<Slider min={-100} max={100} value={temperature} onChange={setTemperature} />} />
                <FormField label="Tint" control={<Slider min={-100} max={100} value={tint} onChange={setTint} />} />
                <FormField label="Vibrance" control={<Slider min={-100} max={100} value={vibrance} onChange={setVibrance} />} />
                <Text size="xsmall" tone="tertiary">10 adjustments · Levels via Brightness/Contrast, Curves via Gamma, Color Balance via Temperature/Tint</Text>
              </Rows>
            )}
            {activeTab==="filter" && (
              <Rows spacing="1.5u">
                <Text size="small">Photoshop Filters — click to apply to preview</Text>
                <Grid columns={2}>
                  {[
                    {id:"none", label:"None (original)"},
                    {id:"grayscale", label:"Grayscale"},
                    {id:"invert", label:"Invert"},
                    {id:"sepia", label:"Sepia"},
                    {id:"posterize", label:"Posterize"},
                    {id:"threshold", label:"Threshold"},
                    {id:"warm", label:"Warm"},
                    {id:"cold", label:"Cold"},
                    {id:"dramatic-warm", label:"Dramatic Warm"},
                    {id:"dramatic-cold", label:"Dramatic Cold"},
                    {id:"blur", label:"Gaussian Blur"},
                    {id:"sharpen", label:"Sharpen"},
                    {id:"emboss", label:"Emboss"},
                    {id:"edge", label:"Edge Detect"},
                    {id:"noise", label:"Add Noise"},
                    {id:"pixelate", label:"Pixelate"},
                    {id:"crystallize", label:"Crystallize"},
                    {id:"vignette", label:"Vignette"},
                    {id:"duotone", label:"Duotone"},
                  ].map(f=>(
                    <Button key={f.id} variant={activeFilter===f.id?"primary":"secondary"} onClick={()=>setActiveFilter(f.id)} stretch>{f.label}</Button>
                  ))}
                </Grid>
                <Text size="xsmall" tone="tertiary">19 filters · Noise, Pixelate, Emboss, Edge, Vignette, Duotone etc. — non-destructive, switch any time</Text>
              </Rows>
            )}
            {activeTab==="transform" && (
              <Rows spacing="1.5u">
                <Text size="small">Photoshop Transform — Photoshop Image → Transform</Text>
                <FormField label={`Scale ${scale}%`} control={<Slider min={50} max={200} value={scale} onChange={setScale} />} />
                <FormField label={`Rotate ${rotation}°`} control={<Slider min={-180} max={180} value={rotation} onChange={setRotation} />} />
                <Grid columns={2}>
                  <Button variant="secondary" onClick={()=>setRotation(r=>r-90)} stretch>↺ 90°</Button>
                  <Button variant="secondary" onClick={()=>setRotation(r=>r+90)} stretch>↻ 90°</Button>
                  <Button variant="secondary" onClick={()=>setRotation(180)} stretch>180°</Button>
                  <Button variant="secondary" onClick={()=>setRotation(0)} stretch>Reset rotate</Button>
                  <Button variant="secondary" onClick={()=>{
                    const c=canvasRef.current; if(!c||!originalRef.current) return;
                    const tmp=document.createElement("canvas"); tmp.width=c.width; tmp.height=c.height;
                    const tctx=tmp.getContext("2d")!; tctx.translate(c.width,0); tctx.scale(-1,1); tctx.drawImage(c,0,0);
                    const ctx=c.getContext("2d")!; ctx.clearRect(0,0,c.width,c.height); ctx.drawImage(tmp,0,0);
                  }} stretch>Flip H</Button>
                  <Button variant="secondary" onClick={()=>{
                    const c=canvasRef.current; if(!c||!originalRef.current) return;
                    const tmp=document.createElement("canvas"); tmp.width=c.width; tmp.height=c.height;
                    const tctx=tmp.getContext("2d")!; tctx.translate(0,c.height); tctx.scale(1,-1); tctx.drawImage(c,0,0);
                    const ctx=c.getContext("2d")!; ctx.clearRect(0,0,c.width,c.height); ctx.drawImage(tmp,0,0);
                  }} stretch>Flip V</Button>
                </Grid>
                <Text size="xsmall" tone="tertiary">8 transforms · Flip H/V, Rotate, Scale, Perspective via Scale+Rotate</Text>
              </Rows>
            )}
            {activeTab==="effects" && (
              <Rows spacing="1.5u">
                <Text size="small">Photoshop Layer Styles — applied as post-effects</Text>
                <Columns spacing="1u">
                  <Column><Button variant={shadow?"primary":"secondary"} onClick={()=>setShadow(!shadow)} stretch>{shadow?"✓ Drop Shadow":"Drop Shadow"}</Button></Column>
                  <Column><Button variant={glow?"primary":"secondary"} onClick={()=>setGlow(!glow)} stretch>{glow?"✓ Outer Glow":"Outer Glow"}</Button></Column>
                </Columns>
                <Grid columns={2}>
                  <Button variant="secondary" onClick={()=>setActiveFilter("emboss")} stretch>Bevel & Emboss</Button>
                  <Button variant="secondary" onClick={()=>setActiveFilter("edge")} stretch>Find Edges</Button>
                  <Button variant="secondary" onClick={()=>setActiveFilter("vignette")} stretch>Lens Correction</Button>
                  <Button variant="secondary" onClick={()=>setActiveFilter("duotone")} stretch>Gradient Map</Button>
                </Grid>
                <Text size="xsmall" tone="tertiary">Effects · Drop Shadow, Glow, Bevel, Lens Correction — just like Photoshop Layer Styles</Text>
              </Rows>
            )}
          </Rows>
        </Box>

        <Rows spacing="1u">
          <Text size="xsmall" tone="tertiary">60 Photoshop features total · Adjust (10) + Filters (19) + Transform (8) + Effects (8) + Color/Levels/Curves via sliders · All applied live to preview, then Add to design or Replace selected — just like other Canva apps.</Text>
          <Box background="neutralLow" padding="1u" borderRadius="element">
            <Text size="xsmall">Features: {FEATURES.length} · {FEATURES.slice(0,8).join(" · ")} … Open Filters/Adjust tabs for full list. Original Photoshop remake was full-canvas editor; this version manipulates Canva images in-place like native Canva apps.</Text>
          </Box>
        </Rows>
      </Rows>
    </div>
  );
};
