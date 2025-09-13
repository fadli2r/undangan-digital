// pages/api/upgrade/price.js
import dbConnect from "@/lib/dbConnect";
import Invitation from "@/models/Invitation";
import Feature from "@/models/Feature";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const norm = (arr)=>Array.from(new Set((arr||[]).map(x=>String(x||"").toLowerCase().trim()).filter(Boolean)));

export default async function handler(req,res){
  if(req.method!=="POST"){res.setHeader("Allow","POST"); return res.status(405).json({message:"Method not allowed"});}
  const session = await getServerSession(req,res,authOptions);
  if(!session?.user?.email) return res.status(401).json({message:"Unauthorized"});

  const { slug, selectedKeys=[] } = (typeof req.body==="string"?JSON.parse(req.body):req.body)||{};
  if(!slug) return res.status(400).json({message:"Slug diperlukan"});

  await dbConnect();
  const inv = await Invitation.findOne({ user_email: session.user.email, slug: String(slug).toLowerCase() })
    .populate("packageId","featureKeys").lean();
  if(!inv) return res.status(404).json({message:"Undangan tidak ditemukan"});

  const owned = norm([...(inv.packageId?.featureKeys||[]), ...(inv.allowedFeatures||[])]);
  const requested = norm(selectedKeys);
  const toBuyKeys = requested.filter(k=>!owned.includes(k));

  const feats = await Feature.find({ key: { $in: toBuyKeys }, active: true }).select("key name price").lean();
  const items = feats.map(f=>({ key: f.key, name: f.name, price: Number(f.price||0) }));
  const total = items.reduce((s,i)=>s + Number(i.price||0), 0);

  return res.status(200).json({ total, items, alreadyOwned: requested.filter(k=>owned.includes(k)) });
}
