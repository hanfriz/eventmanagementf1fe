// Simple test to verify OptimizedImage component logic
const testUrls = [
  "https://jadwalkajian.com/wp-content/uploads/2022/05/info-kajian-surabaya-05.jpg",
  "https://res.cloudinary.com/example/image/upload/v1234567890/sample.jpg",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
  "https://example.com/unknown-domain.jpg",
  "https://picsum.photos/800/600",
  "https://source.unsplash.com/800x600",
  "https://www.w3schools.com/w3images/lights.jpg",
  "/local-image.jpg",
];

// Simulate the logic from OptimizedImage component
const trustedDomains = [
  "images.unsplash.com",
  "via.placeholder.com",
  "res.cloudinary.com",
  "jadwalkajian.com",
];

function shouldUseOptimizedImage(src) {
  // With the new Next.js config allowing all HTTPS domains,
  // we can be more permissive, but still use fallback for safety
  const shouldUseNextImage = src.startsWith("http")
    ? trustedDomains.some((domain) => src.includes(domain))
    : true; // Relative URLs are always safe

  return !(src.startsWith("http") && !shouldUseNextImage);
}

console.log("Testing OptimizedImage logic with new config:");
testUrls.forEach((url) => {
  const shouldOptimize = shouldUseOptimizedImage(url);
  console.log(
    `${url} -> ${shouldOptimize ? "Next.js Image" : "Regular img tag"}`
  );
});

console.log("\n⚠️  With Next.js config allowing all HTTPS domains:");
console.log("All HTTPS URLs can potentially use Next.js Image optimization");
console.log("But OptimizedImage component provides fallback for safety");
