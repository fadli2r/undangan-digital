// pages/api/invitation/entitlements.js
import dbConnect from "@/lib/dbConnect";
import Invitation from "@/models/Invitation";
import Feature from "@/models/Feature";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req,res){
  if(req.method!=="GET"){ res.setHeader("Allow","GET"); return res.status(405).json({message:"Method not allowed"});}

  const session = await getServerSession(req,res,authOptions);
  if(!session?.user?.email) return res.status(401).json({message:"Unauthorized"});

  const { slug } = req.query;
  if(!slug) return res.status(400).json({message:"Slug diperlukan"});

  await dbConnect();

  const inv = await Invitation.findOne({ user_email: session.user.email, slug: String(slug).toLowerCase() })
    .populate("packageId", "name slug type featureKeys duration")
    .lean();

  if(!inv) return res.status(404).json({message:"Undangan tidak ditemukan"});

  const fromPkg = Array.isArray(inv?.packageId?.featureKeys) ? inv.packageId.featureKeys : [];
  const fromInvite = Array.isArray(inv?.allowedFeatures) ? inv.allowedFeatures : [];
  const allowed = Array.from(new Set([...fromPkg, ...fromInvite].map(k=>String(k).toLowerCase().trim()).filter(Boolean)));

  const allActive = await Feature.find({ active: true }).select("key name price scope").lean();
  const missing = allActive.filter(f => !allowed.includes(String(f.key).toLowerCase()));

  return res.status(200).json({
    invitation: { _id: String(inv._id), slug: inv.slug, package: inv.packageId ? { _id: String(inv.packageId._id), name: inv.packageId.name } : null, allowedFeatures: allowed },
    missingFeatures: missing.map(f => ({ key: f.key, name: f.name, price: Number(f.price||0), scope: f.scope || "invitation" })),
  });
}
