"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import BannerImageUploadPopup from "@/components/admin/BannerImageUploadPopup";
import AddPartnerPopup from "@/components/admin/AddPartnerPopup";
import AddProductImagePopup from "@/components/admin/AddProductImagePopup";

/* ────────────────────────────────────────────────────────────────────────── */
/*  GLOBAL MESSAGE OVERLAY                                                  */
/* ────────────────────────────────────────────────────────────────────────── */
function GlobalMessage({ message, type }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div
        className={`p-6 rounded shadow-lg text-2xl text-white ${
          type === "success" ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {message}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  MAIN ADMIN PAGE                                                         */
/* ────────────────────────────────────────────────────────────────────────── */
export default function AdminProductsPartnersPage() {
  const [data, setData] = useState(null);
  const [globalMessage, setGlobalMsg] = useState("");
  const [globalType, setGlobalType] = useState("success");

  /* helper to show temporary notifications */
  const flash = (msg, type = "success") => {
    setGlobalMsg(msg);
    setGlobalType(type);
    setTimeout(() => setGlobalMsg(""), 3000);
  };

  /* fetch JSON once on mount */
  useEffect(() => {
    fetch("/api/getContent/products-and-partners")
      .then((r) => r.json())
      .then(setData)
      .catch((err) => console.error(err));
  }, []);

  /* top‑level text update (meta / banner) */
  const updateText = (section, field, value) =>
    setData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));

  /* partner field update (name / desc) */
  const updatePartnerField = (key, field, value) =>
    setData((prev) => ({
      ...prev,
      partners: {
        ...prev.partners,
        [key]: { ...prev.partners[key], [field]: value },
      },
    }));

  /* add new partner object */
  const addPartner = (partner) =>
    setData((prev) => {
      const nextKey = (
        Math.max(0, ...Object.keys(prev.partners).map(Number)) + 1
      ).toString();
      return { ...prev, partners: { ...prev.partners, [nextKey]: partner } };
    });

  /* remove partner by name */
  const removePartner = (name) =>
    setData((prev) => {
      const p = { ...prev.partners };
      Object.keys(p).forEach((k) => {
        if (p[k].name === name) delete p[k];
      });
      return { ...prev, partners: p };
    });

  /* add / remove product image   */
  const addProdImg = ({ key, imagePath }) =>
    setData((prev) => {
      const imgs = prev.partners[key].images || [];
      return {
        ...prev,
        partners: {
          ...prev.partners,
          [key]: { ...prev.partners[key], images: [...imgs, imagePath] },
        },
      };
    });
  const delProdImg = (key, src) =>
    setData((prev) => {
      const imgs = (prev.partners[key].images || []).filter((i) => i !== src);
      return {
        ...prev,
        partners: {
          ...prev.partners,
          [key]: { ...prev.partners[key], images: imgs },
        },
      };
    });

  /* ───────────  NEW – Procurement partner helpers ─────────── */
  const addProcLogo = ({ key, imagePath }) =>
    setData((prev) => ({
      ...prev,
      procurementPartners: { ...prev.procurementPartners, [key]: imagePath },
    }));

  const removeProcLogo = (key) =>
    setData((prev) => {
      const obj = { ...prev.procurementPartners };
      delete obj[key];
      return { ...prev, procurementPartners: obj };
    });

  /* loading splash */
  if (!data)
    return (
      <div className="p-6 text-center text-white text-2xl">
        Loading all data. Please wait...
      </div>
    );

  /* ─────────── page JSX ─────────── */
  return (
    <div className="admin-dashboard p-6 bg-gray-50 min-h-screen">
      {globalMessage && (
        <GlobalMessage message={globalMessage} type={globalType} />
      )}

      <h1 className="text-5xl font-bold mb-8">
        Products &amp; Partners Editor
      </h1>

      <BannerSection banner={data.banner} updateText={updateText} />

      <PartnersSection
        partners={data.partners}
        onUpdateField={updatePartnerField}
        onAddPartner={addPartner}
        onRemovePartner={removePartner}
        onAddImage={addProdImg}
        onRemoveImage={delProdImg}
        flash={flash}
      />

      {/* NEW PROCUREMENT SECTION */}
      <ProcurementSection
        logos={data.procurementPartners}
        onAddLogo={addProcLogo}
        onRemoveLogo={removeProcLogo}
        flash={flash}
      />

      <SEOSection meta={data.meta} updateText={updateText} />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  BANNER SECTION                                                          */
/* ────────────────────────────────────────────────────────────────────────── */
function BannerSection({ banner, updateText }) {
  const [showPop, setShowPop] = useState(false);

  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">Banner Section</h2>

      <div className="mb-4">
        <Image
          src={banner.image}
          alt={banner.alt}
          width={300}
          height={150}
          objectFit="cover"
          className="rounded"
        />
      </div>

      <button
        onClick={() => setShowPop(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded mb-4 text-2xl"
      >
        Upload New Image
      </button>

      <div className="text-2xl">
        <p className="font-medium">
          <EditableText
            section="banner"
            field="tagline"
            text={banner.tagline}
            onTextUpdated={(v) => updateText("banner", "tagline", v)}
          />
        </p>
        <p className="text-gray-600">
          <EditableText
            section="banner"
            field="sub"
            text={banner.sub}
            onTextUpdated={(v) => updateText("banner", "sub", v)}
          />
        </p>
      </div>

      {showPop && (
        <BannerImageUploadPopup
          page="products-and-partners"
          banner={banner}
          onClose={() => setShowPop(false)}
          onUpdate={(nb) => {
            updateText("banner", "image", nb.image);
            updateText("banner", "alt", nb.alt);
            setShowPop(false);
          }}
        />
      )}
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  PARTNERS (with product images)                                          */
/* ────────────────────────────────────────────────────────────────────────── */
function PartnersSection({
  partners,
  onUpdateField,
  onAddPartner,
  onRemovePartner,
  onAddImage,
  onRemoveImage,
  flash,
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [imgKey, setImgKey] = useState(null);

  /* backend deletion */
  const deletePartner = async (name) => {
    if (!confirm(`Delete partner "${name}"?`)) return;
    try {
      const res = await fetch("/api/partner/deletePartner", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: name }),
      });
      const out = await res.json();
      if (res.ok) {
        onRemovePartner(name);
        flash("Partner deleted", "success");
      } else flash(out.error || "Error deleting partner", "error");
    } catch (e) {
      flash(e.message, "error");
    }
  };

  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold">Our Partners</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded text-2xl"
        >
          Add Partner
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {Object.entries(partners).map(([k, p]) => (
          <PartnerCard
            key={k}
            index={k}
            partner={p}
            onUpdateField={onUpdateField}
            onDelete={() => deletePartner(p.name)}
            onAddImage={() => setImgKey(k)}
            onRemoveImage={(src) => onRemoveImage(k, src)}
            flash={flash}
          />
        ))}
      </div>

      {/* pop‑ups */}
      {showAdd && (
        <AddPartnerPopup
          onClose={() => setShowAdd(false)}
          onUpdate={(partner) => {
            onAddPartner(partner);
            flash("Partner added", "success");
            setShowAdd(false);
          }}
        />
      )}
      {imgKey !== null && (
        <AddProductImagePopup
          partnerKey={imgKey}
          onClose={() => setImgKey(null)}
          onUpdate={({ imagePath }) => {
            onAddImage({ key: imgKey, imagePath });
            flash("Image uploaded", "success");
            setImgKey(null);
          }}
        />
      )}
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  INDIVIDUAL PARTNER CARD                                                 */
/* ────────────────────────────────────────────────────────────────────────── */
function PartnerCard({
  index,
  partner,
  onUpdateField,
  onDelete,
  onAddImage,
  onRemoveImage,
  flash,
}) {
  const [busy, setBusy] = useState("");

  const deleteImg = async (src) => {
    if (!confirm("Delete this product image?")) return;
    setBusy(src);
    try {
      const r = await fetch("/api/partner/deleteProductImage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerKey: index, imagePath: src }),
      });
      const j = await r.json();
      if (r.ok) {
        onRemoveImage(src);
        flash("Image deleted", "success");
      } else {
        flash(j.error || "Server error", "error");
      }
    } catch (e) {
      flash(e.message, "error");
    }
    setBusy("");
  };

  return (
    <div className="p-6 bg-gray-100 rounded shadow">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-1/4 h-48">
          <Image
            src={partner.logo}
            alt={`${partner.name} logo`}
            layout="fill"
            objectFit="contain"
            className="rounded"
          />
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <h3 className="text-3xl font-semibold">
            <PartnerEditableText
              index={index}
              field="name"
              text={partner.name}
              onTextUpdated={(v) => onUpdateField(index, "name", v)}
            />
          </h3>
          <p className="text-2xl">
            <PartnerEditableText
              index={index}
              field="description"
              text={partner.description}
              onTextUpdated={(v) => onUpdateField(index, "description", v)}
            />
          </p>
        </div>

        <div className="flex flex-col justify-between">
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-500 text-white rounded text-2xl mb-2"
          >
            Delete Partner
          </button>
          <button
            onClick={onAddImage}
            className="px-4 py-2 bg-green-500 text-white rounded text-2xl"
          >
            Add Product Image
          </button>
        </div>
      </div>

      {partner.images?.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-6">
          {partner.images.map((src, i) => (
            <div key={i} className="relative w-full h-40">
              <Image
                src={src}
                alt={`Product ${i + 1}`}
                layout="fill"
                objectFit="cover"
                className="rounded"
              />
              <button
                onClick={() => deleteImg(src)}
                disabled={busy === src}
                className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm"
              >
                {busy === src ? "Deleting…" : "Delete Image"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  NEW  ‑‑   PROCUREMENT PARTNER LOGOS                                     */
/* ────────────────────────────────────────────────────────────────────────── */
function ProcurementSection({ logos, onAddLogo, onRemoveLogo, flash }) {
  const [showAdd, setShowAdd] = useState(false);

  /* delete backend + state */
  const deleteLogo = async (key) => {
    if (!confirm("Delete this procurement partner?")) return;
    try {
      const r = await fetch("/api/procurement-partner/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const j = await r.json();
      if (r.ok) {
        onRemoveLogo(key);
        flash("Logo deleted", "success");
      } else {
        flash(j.error || "Server error", "error");
      }
    } catch (e) {
      flash(e.message, "error");
    }
  };

  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold">Procurement Partners</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded text-2xl"
        >
          Add Logo
        </button>
      </div>

      {/* grid of logos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Object.entries(logos).map(([k, src]) => (
          <div key={k} className="relative w-full h-40 bg-gray-100 rounded">
            <Image src={src} alt={k} layout="fill" objectFit="contain" />
            <button
              onClick={() => deleteLogo(k)}
              className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* simple upload pop‑up */}
      {showAdd && (
        <AddProcurementLogoPopup
          onClose={() => setShowAdd(false)}
          onUploaded={({ key, imagePath }) => {
            onAddLogo({ key, imagePath });
            flash("Logo added", "success");
            setShowAdd(false);
          }}
        />
      )}
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  SIMPLE POP‑UP FOR PROCUREMENT LOGO UPLOAD                               */
/* ────────────────────────────────────────────────────────────────────────── */
function AddProcurementLogoPopup({ onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!file) {
      alert("Select a .webp file first");
      return;
    }
    if (file.type !== "image/webp") {
      alert("Only .webp allowed");
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);

    /* filename preserved server‑side */
    fd.append("filename", file.name);

    const r = await fetch("/api/procurement-partner/add", {
      method: "POST",
      body: fd,
    });
    const j = await r.json();
    setLoading(false);
    if (r.ok) {
      /* determine new key (logoN) from filename */
      const match = file.name.match(/(\d+)\.webp$/i);
      const key = match ? `logo${match[1]}` : `logo${Date.now()}`;
      onUploaded({ key, imagePath: j.imagePath });
    } else {
      alert(j.error || "Upload failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold">Add Procurement Partner Logo</h2>
        <input
          type="file"
          accept=".webp"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            {loading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  SEO SECTION (unchanged)                                                 */
/* ────────────────────────────────────────────────────────────────────────── */
function SEOSection({ meta, updateText }) {
  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">SEO Settings</h2>
      <div className="mb-4 text-2xl">
        {["title", "description", "keywords"].map((f) => (
          <p key={f}>
            <span className="font-medium">
              {f[0].toUpperCase() + f.slice(1)}:{" "}
            </span>
            <EditableText
              section="meta"
              field={f}
              text={meta[f]}
              onTextUpdated={(v) => updateText("meta", f, v)}
            />
          </p>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  GENERIC INLINE EDIT FIELD                                               */
/* ────────────────────────────────────────────────────────────────────────── */
function EditableText({ section, field, text, onTextUpdated }) {
  const [edit, setEdit] = useState(false);
  const [val, setVal] = useState(text);
  const [busy, setBusy] = useState(false);

  useEffect(() => setVal(text), [text]);

  const save = async () => {
    setBusy(true);
    const payload = { [section]: { [field]: val } };
    const r = await fetch("/api/updateContent/products-and-partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await r.json();
    setBusy(false);
    if (r.ok) {
      onTextUpdated(val);
      setEdit(false);
    } else {
      alert(j.error || "Save error");
    }
  };

  return edit ? (
    <>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="flex-grow text-2xl p-2 border rounded"
      />
      <button
        onClick={save}
        disabled={busy}
        className="ml-2 px-4 py-2 bg-green-500 text-white rounded"
      >
        {busy ? "Saving…" : "Save"}
      </button>
      <button
        onClick={() => setEdit(false)}
        disabled={busy}
        className="ml-2 px-4 py-2 bg-gray-500 text-white rounded"
      >
        Cancel
      </button>
    </>
  ) : (
    <span className="inline-flex items-center">
      <span>{text}</span>
      <span onClick={() => setEdit(true)} className="cursor-pointer ml-1">
        ✏️
      </span>
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  PARTNER‑SCOPED INLINE EDIT                                              */
/* ────────────────────────────────────────────────────────────────────────── */
function PartnerEditableText({ index, field, text, onTextUpdated }) {
  const [edit, setEdit] = useState(false);
  const [val, setVal] = useState(text);
  const [busy, setBusy] = useState(false);

  useEffect(() => setVal(text), [text]);

  const save = async () => {
    setBusy(true);
    const payload = { partners: { [index]: { [field]: val } } };
    const r = await fetch("/api/updateContent/products-and-partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await r.json();
    setBusy(false);
    if (r.ok) {
      onTextUpdated(val);
      setEdit(false);
    } else {
      alert(j.error || "Save error");
    }
  };

  return edit ? (
    <>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="flex-grow text-2xl p-2 border rounded"
      />
      <button
        onClick={save}
        disabled={busy}
        className="ml-2 px-4 py-2 bg-green-500 text-white rounded"
      >
        {busy ? "Saving…" : "Save"}
      </button>
      <button
        onClick={() => setEdit(false)}
        disabled={busy}
        className="ml-2 px-4 py-2 bg-gray-500 text-white rounded"
      >
        Cancel
      </button>
    </>
  ) : (
    <span className="inline-flex items-center">
      <span>{text}</span>
      <span onClick={() => setEdit(true)} className="cursor-pointer ml-1">
        ✏️
      </span>
    </span>
  );
}
