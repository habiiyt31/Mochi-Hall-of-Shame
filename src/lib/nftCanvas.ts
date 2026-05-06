import { getRarity } from "./rarity";
import type { NFTMetadata } from "@/types/contract";

export async function generateNFTImage(nft: NFTMetadata): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 500;
  const ctx = canvas.getContext("2d")!;

  const score = Number(nft.cringe_score);
  const tokenId = Number(nft.entry_id);
  const owner = String(nft.owner);
  const ownerShort = `${owner.slice(0, 8)}...${owner.slice(-6)}`;
  const rarity = getRarity(score, "");

  // Load Mochi image first
  const mochiImg = new Image();
  mochiImg.crossOrigin = "anonymous";
  mochiImg.src = "/mochi.png";
  await new Promise<void>((resolve) => {
    mochiImg.onload = () => resolve();
    mochiImg.onerror = () => resolve();
    setTimeout(resolve, 2000);
  });

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 800, 500);
  bgGrad.addColorStop(0, "#1a1a2e");
  bgGrad.addColorStop(0.5, "#16213e");
  bgGrad.addColorStop(1, "#0f3460");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 800, 500);

  // XP hills
  ctx.fillStyle = "#2d5a1e";
  ctx.beginPath();
  ctx.moveTo(0, 500);
  ctx.quadraticCurveTo(200, 380, 400, 420);
  ctx.quadraticCurveTo(600, 460, 800, 390);
  ctx.lineTo(800, 500);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#3a7a28";
  ctx.beginPath();
  ctx.moveTo(0, 500);
  ctx.quadraticCurveTo(150, 440, 350, 460);
  ctx.quadraticCurveTo(550, 480, 800, 450);
  ctx.lineTo(800, 500);
  ctx.closePath();
  ctx.fill();

  // Stars
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  [[50,30],[120,60],[200,20],[350,45],[500,25],[650,55],[720,30],[780,50]].forEach(([x,y]) => {
    ctx.fillRect(x, y, 2, 2);
  });

  // Rarity border
  ctx.shadowColor = rarity.color;
  ctx.shadowBlur = 30;
  ctx.strokeStyle = rarity.color;
  ctx.lineWidth = 3;
  ctx.strokeRect(16, 16, 768, 468);
  ctx.shadowBlur = 0;

  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1;
  ctx.strokeRect(24, 24, 752, 452);

  // Header bar
  const headerGrad = ctx.createLinearGradient(0, 0, 800, 0);
  headerGrad.addColorStop(0, "rgba(0,0,128,0.9)");
  headerGrad.addColorStop(1, "rgba(16,132,208,0.9)");
  ctx.fillStyle = headerGrad;
  ctx.fillRect(16, 16, 768, 36);

  ctx.fillStyle = "#ffffff";
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.fillText("Mochi Hall of Shame - Mochi's Certified L", 30, 39);

  ["#ff5f57", "#ffbd2e", "#28c840"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(730 + i * 18, 22, 12, 12);
  });

  // Rarity badge
  ctx.font = 'bold 13px "Courier New", monospace';
  const badgeText = `${rarity.emoji} ${rarity.label}`;
  const badgeW = ctx.measureText(badgeText).width + 20;
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(30, 66, badgeW, 26);
  ctx.strokeStyle = rarity.color;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(30, 66, badgeW, 26);
  ctx.fillStyle = rarity.color;
  ctx.shadowColor = rarity.color;
  ctx.shadowBlur = 8;
  ctx.fillText(badgeText, 40, 84);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = '12px "Courier New", monospace';
  ctx.textAlign = "right";
  ctx.fillText(`Token #${tokenId}`, 770, 84);
  ctx.textAlign = "left";

  // Mochi image with screen blend
  if (mochiImg.naturalWidth > 0) {
    ctx.globalCompositeOperation = "screen";
    ctx.drawImage(mochiImg, 30, 90, 90, 90);
    ctx.globalCompositeOperation = "source-over";
  }

  // Title
  ctx.fillStyle = "#ffffff";
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.fillText("MOCHI'S", 135, 120);

  ctx.fillStyle = rarity.color;
  ctx.shadowColor = rarity.color;
  ctx.shadowBlur = 12;
  ctx.font = 'bold 28px "Courier New", monospace';
  ctx.fillText("CERTIFIED L", 135, 158);
  ctx.shadowBlur = 0;

  // Divider
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(30, 185);
  ctx.lineTo(770, 185);
  ctx.stroke();
  ctx.setLineDash([]);

  // Owner
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = '12px "Courier New", monospace';
  ctx.fillText("OWNER:", 30, 210);

  ctx.fillStyle = "#ffffff";
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.fillText(ownerShort, 30, 232);

  // Roast box
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(30, 248, 740, 100);
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 248, 740, 100);
  ctx.fillStyle = rarity.color;
  ctx.fillRect(30, 248, 4, 100);

  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = '11px "Courier New", monospace';
  ctx.fillText("MOCHI SAYS:", 44, 268);

  ctx.fillStyle = "#ffffff";
  ctx.font = '13px "Courier New", monospace';
  wrapText(ctx, `"${nft.roast_text}"`, 44, 290, 710, 20);

  // Score bar
  const barY = 368;
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = '11px "Courier New", monospace';
  ctx.fillText("CRINGE SCORE", 30, barY);

  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(30, barY + 8, 400, 16);

  const barGrad = ctx.createLinearGradient(30, 0, 430, 0);
  barGrad.addColorStop(0, "#00cc66");
  barGrad.addColorStop(0.5, "#ffaa00");
  barGrad.addColorStop(1, "#ff0066");
  ctx.fillStyle = barGrad;
  ctx.fillRect(30, barY + 8, (score / 100) * 400, 16);

  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;
  ctx.strokeRect(30, barY + 8, 400, 16);

  ctx.fillStyle = rarity.color;
  ctx.shadowColor = rarity.color;
  ctx.shadowBlur = 10;
  ctx.font = 'bold 36px "Courier New", monospace';
  ctx.fillText(`${score}/100`, 450, barY + 22);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = '12px "Courier New", monospace';
  ctx.fillText(rarity.description, 30, barY + 44);

  // Footer
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(30, 430);
  ctx.lineTo(770, 430);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = '11px "Courier New", monospace';
  ctx.fillText("Verified by GenLayer AI Validators Consensus • Built on GenLayer", 30, 450);
  ctx.textAlign = "right";
  ctx.fillText("mochi-hall-of-shame.vercel.app", 770, 450);
  ctx.textAlign = "left";

  // Stamp
  ctx.save();
  ctx.translate(680, 300);
  ctx.rotate(-0.3);
  ctx.strokeStyle = "rgba(255,0,0,0.7)";
  ctx.lineWidth = 3;
  ctx.strokeRect(-60, -20, 120, 40);
  ctx.fillStyle = "rgba(255,0,0,0.7)";
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.textAlign = "center";
  ctx.fillText("CERTIFIED MOCHI", 0, -4);
  ctx.fillText("ON-CHAIN", 0, 12);
  ctx.restore();
  ctx.textAlign = "left";

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png", 0.95);
  });
}

export async function downloadNFTImage(nft: NFTMetadata): Promise<void> {
  const blob = await generateNFTImage(nft);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mochi-certified-l-${Number(nft.entry_id)}.png`;
  a.click();
  URL.revokeObjectURL(url);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  let lineCount = 0;
  const maxLines = 3;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      if (lineCount >= maxLines - 1) {
        ctx.fillText(line.slice(0, -1) + "...", x, currentY);
        return;
      }
      ctx.fillText(line, x, currentY);
      line = words[i] + " ";
      currentY += lineHeight;
      lineCount++;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}