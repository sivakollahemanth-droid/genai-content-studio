/* ===== CONFIG.JS — Static data, templates, tool definitions ===== */

const CONFIG = {
  API_URL: 'https://api.anthropic.com/v1/messages',
  DEFAULT_MODEL: 'claude-sonnet-4-20250514',
  MAX_TOKENS: 1200,

  TOOLS: {
    'Blog Post':            { type: 'blog',    subtitle: 'Craft long-form content with precision and personality.' },
    'Social Media':         { type: 'social',  subtitle: 'Engage your audience across every platform.' },
    'Email Copy':           { type: 'email',   subtitle: 'Write emails that get opened and clicked.' },
    'Ad Copy':              { type: 'ad',      subtitle: 'Headlines that stop the scroll.' },
    'Product Description':  { type: 'product', subtitle: 'Descriptions that convert browsers into buyers.' },
    'Rewriter':             { type: 'blog',    subtitle: 'Transform existing content into something better.' },
    'Summarizer':           { type: 'blog',    subtitle: 'Distil long content into sharp insights.' },
    'Idea Generator':       { type: 'blog',    subtitle: 'Brainstorm content ideas with AI creativity.' },
  },

  BADGE_CLASSES: {
    blog: 'badge-blog', social: 'badge-social', email: 'badge-email',
    ad: 'badge-ad', product: 'badge-product'
  },

  TEMPLATES: [
    {
      emoji: '📋',
      name: 'Listicle',
      desc: 'Top-N format with punchy headers. Great for SEO and social sharing.',
      tag: 'Blog Post',
      tone: 'witty',
      prompt: 'Top 10 ways [topic] is transforming industries in 2025 — with real examples and actionable takeaways'
    },
    {
      emoji: '🧭',
      name: 'How-To Guide',
      desc: 'Step-by-step instructional content that builds trust and authority.',
      tag: 'Blog Post',
      tone: 'educational',
      prompt: 'A complete beginner\'s guide to [topic]: step-by-step from zero to confident'
    },
    {
      emoji: '🚀',
      name: 'Product Launch',
      desc: 'Announce your product with impact, clarity, and excitement.',
      tag: 'Ad Copy',
      tone: 'inspirational',
      prompt: 'Announcing our new [product]: a game-changing solution that [key benefit] for [target audience]'
    },
    {
      emoji: '🧵',
      name: 'Twitter Thread',
      desc: '10-tweet narrative arc that hooks, educates, and goes viral.',
      tag: 'Social Media',
      tone: 'casual',
      prompt: 'Twitter thread: The surprising truth about [topic] that nobody is talking about (10 tweets)'
    },
    {
      emoji: '📧',
      name: 'Welcome Email',
      desc: 'Onboard new subscribers or customers with warmth and clarity.',
      tag: 'Email Copy',
      tone: 'casual',
      prompt: 'Welcome email for new [product/service] users: friendly intro, key features, and next steps'
    },
    {
      emoji: '📰',
      name: 'Newsletter',
      desc: 'Curated weekly digest that keeps your audience engaged.',
      tag: 'Email Copy',
      tone: 'professional',
      prompt: 'Weekly newsletter for [industry]: top 5 news items, a key insight, and one actionable tip'
    },
    {
      emoji: '🏷️',
      name: 'Product Listing',
      desc: 'E-commerce descriptions that highlight benefits over features.',
      tag: 'Product Description',
      tone: 'persuasive',
      prompt: 'Product description for [product name]: emphasize benefits, target [customer type], include key specs'
    },
    {
      emoji: '💡',
      name: 'Thought Leadership',
      desc: 'Opinion piece that positions you as an expert in your field.',
      tag: 'Blog Post',
      tone: 'inspirational',
      prompt: 'My bold prediction about the future of [industry/topic] and what leaders must do to prepare'
    },
  ],

  SYSTEM_PROMPTS: {
    'Blog Post':           'You are an expert blog writer. Write compelling, well-structured blog content with a clear intro, body paragraphs, and conclusion. Be direct — output only the content, no meta-commentary.',
    'Social Media':        'You are a social media expert. Write engaging, platform-native content with hooks, hashtags where appropriate, and a call to action. Output only the post content.',
    'Email Copy':          'You are an email copywriter. Write email copy with a compelling subject line (labeled "Subject:"), a strong opening, clear body, and a CTA. Output only the email.',
    'Ad Copy':             'You are an advertising copywriter. Write punchy, benefit-driven ad copy with a headline, subheadline, and body. Output only the ad copy.',
    'Product Description': 'You are a product copywriter. Write benefit-focused product descriptions that convert. Lead with the benefit, not the feature. Output only the description.',
    'Rewriter':            'You are a content editor. Rewrite the provided text to be clearer, more engaging, and better structured while preserving the original meaning. Output only the rewritten content.',
    'Summarizer':          'You are a content summarizer. Create a concise, well-organized summary of the provided content. Output only the summary.',
    'Idea Generator':      'You are a creative strategist. Generate a diverse, actionable list of content ideas on the given topic. Format as a numbered list with brief explanations. Output only the ideas.',
  }
};
