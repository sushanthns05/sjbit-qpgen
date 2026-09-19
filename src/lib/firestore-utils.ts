export function serializeFirestoreData(data: any): any {
  if (data === null || data === undefined) return data;
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => serializeFirestoreData(item));
  }
  
  // Handle Firestore Timestamps
  if (typeof data === "object" && data !== null) {
    // If it has a toDate method, it's a Firestore Timestamp
    if (typeof data.toDate === "function") {
      return data.toDate().toISOString();
    }
    
    // If it is a native Date
    if (data instanceof Date) {
      return data.toISOString();
    }
    
    // If it has an id property and firestore property, it's likely a DocumentReference
    if (data.firestore && data.id) {
      return data.id;
    }
    
    // Recursive case for normal objects
    const result: any = {};
    for (const key of Object.keys(data)) {
      result[key] = serializeFirestoreData(data[key]);
    }
    return result;
  }
  
  // Primitives
  return data;
}

export function serializeFirestoreDoc(doc: any): any {
  if (!doc) return null;
  const data = doc.data ? doc.data() : doc;
  return {
    ...serializeFirestoreData(data),
    id: doc.id,
  };
}
