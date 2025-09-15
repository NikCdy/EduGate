const axios = require('axios');
const dotenv = require('dotenv');
const xml2js = require('xml2js');

dotenv.config();

// Enhanced arXiv API fetch with better error handling
const fetchArXivPapers = async (query, maxResults = 10) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await axios.get(`http://export.arxiv.org/api/query`, {
      params: {
        search_query: `all:${query}`,
        max_results: maxResults,
        sortBy: 'relevance',
        sortOrder: 'descending'
      },
      timeout: 8000,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(response.data);
    
    if (!result.feed || !result.feed.entry) {
      return [];
    }
    
    // Handle single entry case
    const entries = Array.isArray(result.feed.entry) ? result.feed.entry : [result.feed.entry];
    
    const papers = entries.map((entry) => {
      const authors = Array.isArray(entry.author) 
        ? entry.author.map(author => author.name) 
        : entry.author ? [entry.author.name] : ['Unknown'];
      
      // Extract arXiv ID for better linking
      const arxivId = entry.id.split('/').pop().split('v')[0];
      
      return {
        id: `arxiv-${arxivId}`,
        title: entry.title.replace(/\n/g, ' ').trim(),
        abstract: entry.summary.replace(/\n/g, ' ').trim(),
        authors,
        published: entry.published,
        updated: entry.updated,
        link: entry.id,
        url: `https://arxiv.org/abs/${arxivId}`,
        pdfUrl: `https://arxiv.org/pdf/${arxivId}.pdf`,
        type: 'paper',
        source: 'arXiv'
      };
    });
    
    console.log(`Fetched ${papers.length} papers from arXiv`);
    return papers;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('arXiv request timed out');
    } else {
      console.error('Error fetching arXiv papers:', error.message);
    }
    return [];
  }
};

// Enhanced YouTube API fetch with better error handling
const fetchYouTubeVideos = async (query, maxResults = 10) => {
  try {
    if (!process.env.VITE_YOUTUBE_API_KEY) {
      console.warn('YouTube API key not configured');
      return [];
    }
    
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: `${query} educational tutorial`,
        maxResults,
        key: process.env.VITE_YOUTUBE_API_KEY,
        type: 'video',
        videoEmbeddable: true,
        relevanceLanguage: 'en',
        order: 'relevance',
        videoDuration: 'medium'
      },
      timeout: 8000
    });
    
    if (!response.data.items) {
      return [];
    }
    
    const videos = response.data.items.map(item => {
      const thumbnail = item.snippet.thumbnails.high || 
                       item.snippet.thumbnails.medium || 
                       item.snippet.thumbnails.default;
      
      return {
        id: `youtube-${item.id.videoId}`,
        title: item.snippet.title,
        description: item.snippet.description.substring(0, 200) + '...',
        thumbnail: thumbnail?.url,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
        videoId: item.id.videoId,
        link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
        type: 'video',
        source: 'YouTube'
      };
    });
    
    console.log(`Fetched ${videos.length} videos from YouTube`);
    return videos;
  } catch (error) {
    if (error.response?.status === 403) {
      console.error('YouTube API quota exceeded or invalid key');
    } else {
      console.error('Error fetching YouTube videos:', error.message);
    }
    return [];
  }
};

// Fetch articles from dev.to API
const fetchDevToArticles = async (query, page = 1, perPage = 10) => {
  try {
    const response = await axios.get('https://dev.to/api/articles', {
      params: {
        tag: query,
        page,
        per_page: perPage
      }
    });
    
    const articles = response.data.map(article => ({
      id: `devto-${article.id}`,
      title: article.title,
      description: article.description,
      link: article.url,
      publishedAt: article.published_at,
      tags: article.tag_list,
      author: article.user.name,
      authorImage: article.user.profile_image,
      coverImage: article.cover_image,
      type: 'blog',
      source: 'dev.to'
    }));
    
    return articles;
  } catch (error) {
    console.error('Error fetching dev.to articles:', error);
    return [];
  }
};

// Fetch articles from Medium using Google Custom Search API
const fetchMediumArticles = async (query, maxResults = 10) => {
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: process.env.VITE_GOOGLE_API_KEY,
        cx: process.env.VITE_GOOGLE_CSE_ID,
        q: `${query} site:medium.com`,
        num: maxResults
      }
    });
    
    const articles = response.data.items.map(item => ({
      id: `medium-${Buffer.from(item.link).toString('base64').substring(0, 20)}`,
      title: item.title,
      description: item.snippet,
      link: item.link,
      displayLink: item.displayLink,
      type: 'blog',
      source: 'Medium'
    }));
    
    return articles;
  } catch (error) {
    console.error('Error fetching Medium articles:', error);
    return [];
  }
};

// Fetch papers from Google Scholar using Google Custom Search API
const fetchGoogleScholarPapers = async (query, maxResults = 10) => {
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: process.env.VITE_GOOGLE_API_KEY,
        cx: process.env.VITE_GOOGLE_CSE_ID,
        q: `${query} site:scholar.google.com`,
        num: maxResults
      }
    });
    
    const papers = response.data.items.map(item => ({
      id: `scholar-${Buffer.from(item.link).toString('base64').substring(0, 20)}`,
      title: item.title,
      description: item.snippet,
      link: item.link,
      displayLink: item.displayLink,
      type: 'paper',
      source: 'Google Scholar'
    }));
    
    return papers;
  } catch (error) {
    console.error('Error fetching Google Scholar papers:', error);
    return [];
  }
};

module.exports = {
  fetchArXivPapers,
  fetchYouTubeVideos,
  fetchDevToArticles,
  fetchMediumArticles,
  fetchGoogleScholarPapers
};