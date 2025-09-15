const axios = require('axios');
const dotenv = require('dotenv');
const cheerio = require('cheerio');

dotenv.config();

// Enhanced in-memory storage with TTL and metadata
let searchCache = {
  blogs: { data: [], lastUpdated: null, ttl: 30 * 60 * 1000 },
  papers: { data: [], lastUpdated: null, ttl: 60 * 60 * 1000 },
  videos: { data: [], lastUpdated: null, ttl: 30 * 60 * 1000 },
  images: { data: [], lastUpdated: null, ttl: 60 * 60 * 1000 },
  pdfs: { data: [], lastUpdated: null, ttl: 60 * 60 * 1000 }
};

const queryCache = new Map();
const QUERY_CACHE_TTL = 10 * 60 * 1000;

const rateLimiter = {
  requests: new Map(),
  maxRequests: 100,
  windowMs: 60 * 1000
};

const isRateLimited = (ip) => {
  const now = Date.now();
  const requests = rateLimiter.requests.get(ip) || [];
  const validRequests = requests.filter(time => now - time < rateLimiter.windowMs);
  
  if (validRequests.length >= rateLimiter.maxRequests) {
    return true;
  }
  
  validRequests.push(now);
  rateLimiter.requests.set(ip, validRequests);
  return false;
};

const isCacheValid = (cacheEntry) => {
  if (!cacheEntry.lastUpdated) return false;
  return Date.now() - cacheEntry.lastUpdated < cacheEntry.ttl;
};

const getQueryFromCache = (query, type) => {
  const cacheKey = `${query}-${type}`;
  const cached = queryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < QUERY_CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setQueryCache = (query, type, data) => {
  const cacheKey = `${query}-${type}`;
  queryCache.set(cacheKey, { data, timestamp: Date.now() });
  
  if (queryCache.size > 1000) {
    const entries = Array.from(queryCache.entries());
    entries.slice(0, 500).forEach(([key]) => queryCache.delete(key));
  }
};

// Initialize search indices
const initializeIndices = async () => {
  try {
    console.log('Search service initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing search service:', error.message);
    return false;
  }
};

// Fetch data from arXiv API
const fetchArXivPapers = async (query, maxResults = 10) => {
  try {
    const response = await axios.get(`http://export.arxiv.org/api/query?search_query=${encodeURIComponent(query)}&max_results=${maxResults}`);
    
    const papers = [];
    const parseString = require('xml2js').parseString;
    
    return new Promise((resolve) => {
      parseString(response.data, (err, result) => {
        if (err || !result.feed || !result.feed.entry) {
          resolve([]);
          return;
        }
        
        const entries = Array.isArray(result.feed.entry) ? result.feed.entry : [result.feed.entry];
        entries.forEach((entry, index) => {
          const paper = {
            id: `arxiv-${index}-${Date.now()}`,
            title: entry.title[0].replace(/\n/g, ' ').trim(),
            abstract: entry.summary[0].replace(/\n/g, ' ').trim(),
            description: entry.summary[0].replace(/\n/g, ' ').trim(),
            authors: Array.isArray(entry.author) ? entry.author.map(author => author.name[0]) : [entry.author.name[0]],
            published: entry.published[0],
            updated: entry.updated[0],
            link: entry.id[0],
            url: entry.id[0],
            type: 'paper',
            source: 'arXiv'
          };
          papers.push(paper);
        });
        resolve(papers);
      });
    });
  } catch (error) {
    console.error('Error fetching arXiv papers:', error);
    return [];
  }
};

// Fetch YouTube videos
const fetchYouTubeVideos = async (query, maxResults = 10) => {
  try {
    const educationalQueries = [
      `${query} tutorial`,
      `${query} explained`,
      `learn ${query}`,
      query
    ];
    
    const allVideos = [];
    
    for (const searchQuery of educationalQueries.slice(0, 2)) {
      try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            q: searchQuery,
            maxResults: Math.ceil(maxResults / 2),
            key: process.env.YOUTUBE_API_KEY,
            type: 'video',
            videoEmbeddable: true,
            order: 'relevance'
          }
        });
        
        const videos = response.data.items.map(item => ({
          id: `youtube-${item.id.videoId}`,
          title: item.snippet.title,
          description: item.snippet.description,
          abstract: item.snippet.description,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
          publishedAt: item.snippet.publishedAt,
          published: item.snippet.publishedAt,
          channelTitle: item.snippet.channelTitle,
          author: item.snippet.channelTitle,
          videoId: item.id.videoId,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          type: 'video',
          source: 'YouTube'
        }));
        
        allVideos.push(...videos);
      } catch (err) {
        console.error(`Error with YouTube query "${searchQuery}":`, err.message);
      }
    }
    
    const uniqueVideos = allVideos.filter((video, index, self) => 
      index === self.findIndex(v => v.videoId === video.videoId)
    );
    
    return uniqueVideos.slice(0, maxResults);
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return [];
  }
};

// Fetch images from Pexels API
const fetchPexelsImages = async (query, perPage = 10) => {
  try {
    const response = await axios.get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}`, {
      headers: {
        Authorization: process.env.PEXELS_API_KEY
      }
    });
    
    const images = response.data.photos.map(photo => ({
      id: `pexels-${photo.id}`,
      title: photo.alt || `Image of ${query}`,
      description: photo.alt || `Image related to ${query}`,
      width: photo.width,
      height: photo.height,
      url: photo.url,
      src: photo.src.medium,
      thumbnail: photo.src.small,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      type: 'image',
      source: 'Pexels'
    }));
    
    return images;
  } catch (error) {
    console.error('Error fetching Pexels images:', error);
    return [];
  }
};

// Fetch PDFs from Google Scholar
const fetchGoogleScholarPDFs = async (query, maxResults = 10) => {
  try {
    const searchUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}&hl=en&num=${maxResults}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const papers = [];
    
    $('.gs_r').each((index, element) => {
      const $element = $(element);
      const title = $element.find('.gs_rt a').text().trim();
      const authors = $element.find('.gs_a').text().trim();
      const snippet = $element.find('.gs_rs').text().trim();
      const link = $element.find('.gs_rt a').attr('href');
      const pdfLink = $element.find('.gs_or_ggsm a[href$=".pdf"]').attr('href');
      const citedBy = $element.find('.gs_fl a:contains("Cited by")').text().trim();
      
      if (title && (link || pdfLink)) {
        papers.push({
          id: `scholar-${index}-${Date.now()}`,
          title,
          authors: authors.split(' - ')[0] || 'Unknown',
          abstract: snippet,
          link: pdfLink || link,
          url: pdfLink || link,
          citedBy,
          type: pdfLink ? 'pdf' : 'paper',
          source: 'Google Scholar'
        });
      }
    });
    
    return papers;
  } catch (error) {
    console.error('Error fetching Google Scholar results:', error);
    return [];
  }
};

// Fetch articles from Medium
const fetchMediumPosts = async (query, maxResults = 10) => {
  try {
    const response = await axios.get(`https://medium.com/feed/tag/${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const posts = [];
    const parseString = require('xml2js').parseString;
    
    return new Promise((resolve) => {
      parseString(response.data, (err, result) => {
        if (err || !result.rss || !result.rss.channel[0].item) {
          resolve([]);
          return;
        }
        
        const items = result.rss.channel[0].item.slice(0, maxResults);
        items.forEach((item, index) => {
          const post = {
            id: `medium-${index}-${Date.now()}`,
            title: item.title[0],
            description: item.description ? item.description[0].replace(/<[^>]*>/g, '').substring(0, 200) + '...' : '',
            abstract: item.description ? item.description[0].replace(/<[^>]*>/g, '').substring(0, 200) + '...' : '',
            url: item.link[0],
            link: item.link[0],
            author: item['dc:creator'] ? item['dc:creator'][0] : 'Medium Author',
            authors: [item['dc:creator'] ? item['dc:creator'][0] : 'Medium Author'],
            published: item.pubDate[0],
            publishedAt: item.pubDate[0],
            type: 'blog',
            source: 'Medium'
          };
          posts.push(post);
        });
        resolve(posts);
      });
    });
  } catch (error) {
    console.error('Error fetching Medium posts:', error);
    return [];
  }
};

// Enhanced web search with multiple sources
const fetchWebContent = async (query, maxResults = 15) => {
  try {
    const results = [];
    
    const searchQueries = [
      query,
      `${query} tutorial`,
      `${query} guide`,
      `learn ${query}`
    ];
    
    for (const searchQuery of searchQueries.slice(0, 2)) {
      try {
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
          params: {
            key: process.env.GOOGLE_API_KEY,
            cx: process.env.GOOGLE_CSE_ID,
            q: searchQuery,
            num: Math.ceil(maxResults / 2)
          }
        });
        
        if (response.data.items) {
          response.data.items.forEach(item => {
            let type = 'blog';
            if (item.link.includes('.pdf')) type = 'pdf';
            else if (item.link.includes('youtube.com') || item.link.includes('youtu.be')) type = 'video';
            else if (item.link.includes('coursera.org') || item.link.includes('edx.org') || item.link.includes('udemy.com')) type = 'course';
            
            results.push({
              id: `web-${Buffer.from(item.link).toString('base64').substring(0, 20)}`,
              title: item.title,
              description: item.snippet,
              abstract: item.snippet,
              url: item.link,
              link: item.link,
              displayLink: item.displayLink,
              type,
              source: 'Web Search'
            });
          });
        }
      } catch (err) {
        console.error(`Error with search query "${searchQuery}":`, err.message);
      }
    }
    
    return results.slice(0, maxResults);
  } catch (error) {
    console.error('Error fetching web content:', error);
    return [];
  }
};

// Store documents in memory with enhanced caching
const indexDocuments = async (indexName, documents) => {
  try {
    if (!documents || documents.length === 0) return;
    
    if (!searchCache[indexName]) {
      searchCache[indexName] = { data: [], lastUpdated: null, ttl: 30 * 60 * 1000 };
    }
    
    documents.forEach(doc => {
      const exists = searchCache[indexName].data.find(existing => existing.id === doc.id);
      if (!exists) {
        searchCache[indexName].data.push(doc);
      }
    });
    
    searchCache[indexName].lastUpdated = Date.now();
    
    if (searchCache[indexName].data.length > 1000) {
      searchCache[indexName].data = searchCache[indexName].data.slice(-800);
    }
    
    console.log(`Stored ${documents.length} documents in ${indexName} (total: ${searchCache[indexName].data.length})`);
  } catch (error) {
    console.error(`Error storing documents in ${indexName}:`, error.message);
  }
};

// Enhanced search with better relevance scoring
const search = async (query, filters = {}) => {
  try {
    const { type, source, page = 1, limit = 10 } = filters;

    const cachedResult = getQueryFromCache(query, type || 'all');
    if (cachedResult) {
      const offset = (page - 1) * limit;
      const results = cachedResult.slice(offset, offset + limit);
      
      return {
        hits: results,
        nbHits: cachedResult.length,
        page,
        limit,
        cached: true
      };
    }

    const offset = (page - 1) * limit;
    const searchTerm = query.toLowerCase();
    const searchWords = searchTerm.split(' ').filter(word => word.length > 2);

    let searchResults = [];
    
    let indicesToSearch = ['blogs', 'papers', 'videos', 'images', 'pdfs'];
    
    if (type && type !== 'all') {
      if (type === 'scholar') {
        indicesToSearch = ['papers', 'pdfs'];
      } else if (type === 'paper') {
        indicesToSearch = ['papers'];
      } else if (type === 'blog') {
        indicesToSearch = ['blogs'];
      } else {
        const indexName = type.endsWith('s') ? type : `${type}s`;
        indicesToSearch = [indexName];
      }
    }
    
    indicesToSearch.forEach(indexName => {
      if (searchCache[indexName] && searchCache[indexName].data) {
        const results = searchCache[indexName].data.filter(item => {
          const title = (item.title || '').toLowerCase();
          const description = (item.description || item.abstract || item.snippet || '').toLowerCase();
          const authors = (item.authors || item.author || '').toString().toLowerCase();
          
          const exactMatch = title.includes(searchTerm) || description.includes(searchTerm);
          const wordMatches = searchWords.some(word => 
            title.includes(word) || description.includes(word) || authors.includes(word)
          );
          
          const sourceMatch = !source || (item.source && item.source === source);
          
          return (exactMatch || wordMatches) && sourceMatch;
        }).map(item => {
          const title = (item.title || '').toLowerCase();
          const description = (item.description || item.abstract || item.snippet || '').toLowerCase();
          const authors = (item.authors || item.author || '').toString().toLowerCase();
          
          let score = 0;
          
          if (title.includes(searchTerm)) score += 10;
          if (description.includes(searchTerm)) score += 5;
          
          searchWords.forEach(word => {
            if (title.includes(word)) score += 3;
            if (description.includes(word)) score += 1;
            if (authors.includes(word)) score += 2;
          });
          
          if (item.publishedAt || item.published || item.updated) {
            const date = new Date(item.publishedAt || item.published || item.updated);
            const daysSincePublished = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSincePublished < 30) score += 2;
          }
          
          return { ...item, relevanceScore: score };
        });
        
        searchResults = searchResults.concat(results);
      }
    });

    searchResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    
    setQueryCache(query, type || 'all', searchResults);
    
    const paginatedResults = searchResults.slice(offset, offset + limit);
    
    return {
      hits: paginatedResults,
      nbHits: searchResults.length,
      page,
      limit
    };
  } catch (error) {
    console.error('Error searching:', error.message);
    return { hits: [], nbHits: 0, page: 1, limit: 10 };
  }
};

// Enhanced fetch and index content with parallel processing
const fetchAndIndexContent = async (query) => {
  try {
    console.log(`Fetching content for query: ${query}`);
    
    const allCacheValid = Object.keys(searchCache).every(key => 
      isCacheValid(searchCache[key])
    );
    
    if (allCacheValid) {
      console.log('Using cached data (still valid)');
      return {
        papers: searchCache.papers.data.length,
        videos: searchCache.videos.data.length,
        images: searchCache.images.data.length,
        blogs: searchCache.blogs.data.length,
        pdfs: searchCache.pdfs.data.length,
        cached: true
      };
    }
    
    const fetchPromises = [
      fetchArXivPapers(query, 8).catch(err => { console.error('ArXiv fetch error:', err); return []; }),
      fetchGoogleScholarPDFs(query, 8).catch(err => { console.error('Scholar fetch error:', err); return []; }),
      fetchYouTubeVideos(query, 10).catch(err => { console.error('YouTube fetch error:', err); return []; }),
      fetchPexelsImages(query, 8).catch(err => { console.error('Pexels fetch error:', err); return []; }),
      fetchWebContent(query, 15).catch(err => { console.error('Web fetch error:', err); return []; }),
      fetchMediumPosts(query, 8).catch(err => { console.error('Medium fetch error:', err); return []; })
    ];
    
    const [papers, scholarResults, videos, images, webResults, mediumPosts] = await Promise.allSettled(fetchPromises);
    
    const papersData = papers.status === 'fulfilled' ? papers.value : [];
    const scholarData = scholarResults.status === 'fulfilled' ? scholarResults.value : [];
    const videosData = videos.status === 'fulfilled' ? videos.value : [];
    const imagesData = images.status === 'fulfilled' ? images.value : [];
    const webData = webResults.status === 'fulfilled' ? webResults.value : [];
    const mediumData = mediumPosts.status === 'fulfilled' ? mediumPosts.value : [];
    
    const webBlogs = webData.filter(result => result.type === 'blog' || result.type === 'course');
    const webPdfs = webData.filter(result => result.type === 'pdf');
    const webVideos = webData.filter(result => result.type === 'video');
    
    const allBlogs = [...webBlogs, ...mediumData];
    const allPapers = [...papersData, ...scholarData.filter(r => r.type === 'paper')];
    const allPdfs = [...webPdfs, ...scholarData.filter(r => r.type === 'pdf')];
    const allVideos = [...videosData, ...webVideos];
    
    await Promise.all([
      indexDocuments('papers', allPapers),
      indexDocuments('videos', allVideos),
      indexDocuments('images', imagesData),
      indexDocuments('blogs', allBlogs),
      indexDocuments('pdfs', allPdfs)
    ]);
    
    console.log(`Indexed: ${allPapers.length} papers, ${allVideos.length} videos, ${imagesData.length} images, ${allBlogs.length} blogs, ${allPdfs.length} PDFs`);
    
    return {
      papers: allPapers.length,
      videos: allVideos.length,
      images: imagesData.length,
      blogs: allBlogs.length,
      pdfs: allPdfs.length,
      total: allPapers.length + allVideos.length + imagesData.length + allBlogs.length + allPdfs.length,
      cached: false
    };
  } catch (error) {
    console.error('Error fetching and indexing content:', error);
    return { error: error.message };
  }
};

const getCacheStats = () => {
  const stats = {};
  Object.keys(searchCache).forEach(key => {
    const cache = searchCache[key];
    stats[key] = {
      count: cache.data.length,
      lastUpdated: cache.lastUpdated,
      isValid: isCacheValid(cache),
      ttl: cache.ttl
    };
  });
  
  return {
    cacheStats: stats,
    queryCache: {
      size: queryCache.size,
      maxSize: 1000
    },
    rateLimiter: {
      activeIPs: rateLimiter.requests.size,
      maxRequests: rateLimiter.maxRequests,
      windowMs: rateLimiter.windowMs
    }
  };
};

const clearExpiredCache = () => {
  Object.keys(searchCache).forEach(key => {
    if (!isCacheValid(searchCache[key])) {
      searchCache[key].data = [];
      searchCache[key].lastUpdated = null;
    }
  });
  
  const now = Date.now();
  for (const [key, value] of queryCache.entries()) {
    if (now - value.timestamp > QUERY_CACHE_TTL) {
      queryCache.delete(key);
    }
  }
};

module.exports = {
  initializeIndices,
  fetchArXivPapers,
  fetchGoogleScholarPDFs,
  fetchYouTubeVideos,
  fetchPexelsImages,
  fetchWebContent,
  fetchMediumPosts,
  indexDocuments,
  search,
  fetchAndIndexContent,
  getCacheStats,
  clearExpiredCache,
  isRateLimited
};