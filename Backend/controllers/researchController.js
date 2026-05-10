const Research = require('../models/Research');
const Episode = require('../models/Episode');

// Research data generator based on niche and topic
const generateResearchData = (niche, topic) => {
    const researchTemplates = {
        'Technology': [
            {
                title: `The Future of ${topic}: What Experts Are Saying`,
                summary: `Leading technology researchers have identified ${topic} as one of the most transformative developments in recent years. Studies show adoption rates have increased by 47% globally, with major corporations investing heavily in this space. The implications for everyday consumers are becoming increasingly significant as the technology matures.`,
                source: 'TechCrunch',
                sourceUrl: 'https://techcrunch.com',
                publicationDate: '2 days ago',
                relevanceScore: 0.98,
                category: 'News'
            },
            {
                title: `How ${topic} is Reshaping the Tech Industry`,
                summary: `Industry analysts from Gartner and Forrester Research have published comprehensive reports on ${topic}, highlighting its disruptive potential across multiple sectors. The technology has already displaced traditional methods in several key areas, and experts predict widespread adoption within the next 18 months.`,
                source: 'Wired',
                sourceUrl: 'https://wired.com',
                publicationDate: '1 week ago',
                relevanceScore: 0.95,
                category: 'Industry Blogs'
            },
            {
                title: `${topic} and Artificial Intelligence: A Powerful Combination`,
                summary: `Researchers at MIT and Stanford have published groundbreaking studies on the intersection of ${topic} and AI. Their findings suggest that combining these technologies could yield productivity improvements of up to 60% in enterprise environments. Several Fortune 500 companies are already piloting integrated solutions.`,
                source: 'MIT Technology Review',
                sourceUrl: 'https://technologyreview.com',
                publicationDate: '3 days ago',
                relevanceScore: 0.92,
                category: 'Academic'
            },
            {
                title: `Top 10 Misconceptions About ${topic}`,
                summary: `Despite growing interest in ${topic}, significant misconceptions persist among both consumers and professionals. This comprehensive analysis debunks the most common myths and provides evidence-based clarifications. Understanding these misconceptions is crucial for anyone working in or reporting on the technology sector.`,
                source: 'Forbes Technology',
                sourceUrl: 'https://forbes.com/technology',
                publicationDate: '5 days ago',
                relevanceScore: 0.89,
                category: 'Industry Blogs'
            },
            {
                title: `${topic}: Ethical Considerations and Future Implications`,
                summary: `As ${topic} continues to evolve, ethicists and technology leaders are raising important questions about its societal impact. Recent surveys indicate that 73% of technology professionals believe stronger regulatory frameworks are needed. Several international bodies are now working on comprehensive guidelines.`,
                source: 'The Verge',
                sourceUrl: 'https://theverge.com',
                publicationDate: '1 day ago',
                relevanceScore: 0.87,
                category: 'News'
            },
            {
                title: `Investment Trends in ${topic}: A 2025 Overview`,
                summary: `Venture capital investment in ${topic} reached a record high this year, with over $12 billion deployed across 340 deals globally. Investors are particularly excited about enterprise applications and consumer-facing products. Several startups in this space have achieved unicorn status within 18 months of founding.`,
                source: 'Bloomberg Technology',
                sourceUrl: 'https://bloomberg.com/technology',
                publicationDate: '4 days ago',
                relevanceScore: 0.85,
                category: 'News'
            },
            {
                title: `${topic} in Practice: Real World Case Studies`,
                summary: `Five leading companies share their experiences implementing ${topic} in their operations. The case studies reveal both the opportunities and challenges involved, providing practical insights for organizations considering adoption. Key success factors include executive sponsorship, phased implementation, and comprehensive staff training.`,
                source: 'Harvard Business Review',
                sourceUrl: 'https://hbr.org',
                publicationDate: '1 week ago',
                relevanceScore: 0.83,
                category: 'Academic'
            },
            {
                title: `The Global Race for ${topic} Dominance`,
                summary: `Nations around the world are competing to establish leadership in ${topic}, with significant government investments being announced regularly. The United States, China, and the European Union have each outlined ambitious national strategies. Experts warn that falling behind in this race could have serious economic and security implications.`,
                source: 'Financial Times',
                sourceUrl: 'https://ft.com',
                publicationDate: '3 days ago',
                relevanceScore: 0.81,
                category: 'News'
            }
        ],
        'Business & Entrepreneurship': [
            {
                title: `Building a Successful Business Around ${topic}`,
                summary: `Entrepreneurs who have built successful businesses around ${topic} share their strategies and lessons learned. Research shows that companies in this space that focus on customer experience achieve 40% higher revenue growth than those focused solely on product features. The key differentiators are clear value proposition and strong community building.`,
                source: 'Entrepreneur Magazine',
                sourceUrl: 'https://entrepreneur.com',
                publicationDate: '2 days ago',
                relevanceScore: 0.97,
                category: 'Industry Blogs'
            },
            {
                title: `${topic}: Market Opportunities and Business Models`,
                summary: `Market research firm McKinsey has identified ${topic} as one of the top 10 business opportunities of the decade. The total addressable market is estimated at $340 billion, with significant untapped potential in emerging markets. Three distinct business models have emerged as most viable for long-term profitability.`,
                source: 'McKinsey & Company',
                sourceUrl: 'https://mckinsey.com',
                publicationDate: '1 week ago',
                relevanceScore: 0.94,
                category: 'Academic'
            },
            {
                title: `Leadership Lessons From ${topic} Industry Pioneers`,
                summary: `Interviews with 50 industry leaders reveal common leadership traits and decision-making frameworks that have driven success in ${topic}. Adaptability, data-driven decision making, and strong team culture emerge as the most cited success factors. These leaders also emphasize the importance of long-term thinking over short-term gains.`,
                source: 'Inc. Magazine',
                sourceUrl: 'https://inc.com',
                publicationDate: '4 days ago',
                relevanceScore: 0.91,
                category: 'Industry Blogs'
            },
            {
                title: `Funding Your ${topic} Venture: A Complete Guide`,
                summary: `From bootstrapping to Series C funding, this comprehensive guide covers all financing options available to entrepreneurs in the ${topic} space. Recent data shows that startups with diverse funding sources are 3x more likely to reach profitability. Expert investors share what they look for when evaluating pitches in this sector.`,
                source: 'Forbes',
                sourceUrl: 'https://forbes.com',
                publicationDate: '5 days ago',
                relevanceScore: 0.88,
                category: 'News'
            },
            {
                title: `${topic} Trends Shaping Business Strategy in 2025`,
                summary: `Business strategists and consultants identify the top trends in ${topic} that will shape corporate strategy over the next three years. Companies that fail to adapt risk losing significant market share to more agile competitors. The report provides a practical framework for integrating these trends into existing business models.`,
                source: 'Wall Street Journal',
                sourceUrl: 'https://wsj.com',
                publicationDate: '3 days ago',
                relevanceScore: 0.86,
                category: 'News'
            },
            {
                title: `Customer Psychology and ${topic}: What Drives Decisions`,
                summary: `New research from behavioral economists reveals how customer psychology influences decisions related to ${topic}. Understanding these psychological drivers can help businesses craft more effective marketing messages and product experiences. Companies applying these insights have seen conversion rates improve by an average of 28%.`,
                source: 'Psychology Today Business',
                sourceUrl: 'https://psychologytoday.com',
                publicationDate: '6 days ago',
                relevanceScore: 0.84,
                category: 'Academic'
            },
            {
                title: `Scaling a ${topic} Business: Challenges and Solutions`,
                summary: `Rapid growth presents unique challenges for businesses in the ${topic} sector. This analysis examines the most common scaling obstacles and the strategies successful companies have used to overcome them. Infrastructure, talent acquisition, and maintaining culture are identified as the three critical scaling challenges.`,
                source: 'TechCrunch',
                sourceUrl: 'https://techcrunch.com',
                publicationDate: '1 week ago',
                relevanceScore: 0.82,
                category: 'News'
            },
            {
                title: `Global Expansion Strategies for ${topic} Companies`,
                summary: `As domestic markets mature, ${topic} companies are increasingly looking to international expansion for growth. This report examines successful and failed global expansion attempts, drawing lessons that can guide strategic decision-making. Cultural adaptation, local partnerships, and regulatory compliance emerge as key success factors.`,
                source: 'Harvard Business Review',
                sourceUrl: 'https://hbr.org',
                publicationDate: '2 weeks ago',
                relevanceScore: 0.79,
                category: 'Academic'
            }
        ],
        'Health & Wellness': [
            {
                title: `The Science Behind ${topic}: Latest Research Findings`,
                summary: `Groundbreaking research published in the New England Journal of Medicine sheds new light on ${topic} and its effects on human health. The study followed 10,000 participants over five years and found significant correlations between ${topic} practices and improved health outcomes. Experts are calling these findings a game-changer for preventive healthcare.`,
                source: 'Medical News Today',
                sourceUrl: 'https://medicalnewstoday.com',
                publicationDate: '3 days ago',
                relevanceScore: 0.97,
                category: 'Academic'
            },
            {
                title: `How ${topic} is Transforming Modern Healthcare`,
                summary: `Healthcare providers across the country are integrating ${topic} into their treatment protocols with remarkable results. Patient satisfaction scores have improved by 35%, and readmission rates have dropped significantly at facilities that have adopted comprehensive ${topic} programs. The financial case for implementation is becoming increasingly compelling.`,
                source: 'Health Affairs',
                sourceUrl: 'https://healthaffairs.org',
                publicationDate: '1 week ago',
                relevanceScore: 0.94,
                category: 'Industry Blogs'
            },
            {
                title: `${topic} for Mental Health: Evidence-Based Approaches`,
                summary: `Mental health professionals are increasingly recommending ${topic} as a complementary approach to traditional therapy. Recent meta-analyses of 200+ studies confirm the effectiveness of ${topic} interventions for anxiety, depression, and stress management. The American Psychological Association has updated its guidelines to include ${topic} recommendations.`,
                source: 'Psychology Today',
                sourceUrl: 'https://psychologytoday.com',
                publicationDate: '2 days ago',
                relevanceScore: 0.92,
                category: 'Academic'
            },
            {
                title: `Debunking Common Myths About ${topic}`,
                summary: `Despite its growing popularity, ${topic} is surrounded by numerous misconceptions that can prevent people from experiencing its benefits. This comprehensive fact-check examines the 10 most common myths, drawing on peer-reviewed research to separate fact from fiction. Healthcare professionals emphasize the importance of evidence-based understanding.`,
                source: 'WebMD',
                sourceUrl: 'https://webmd.com',
                publicationDate: '4 days ago',
                relevanceScore: 0.89,
                category: 'News'
            },
            {
                title: `${topic} and Longevity: What the Data Shows`,
                summary: `Longitudinal studies spanning decades are revealing fascinating connections between ${topic} and healthy aging. Populations with high engagement in ${topic} consistently show lower rates of chronic disease and higher quality of life scores in later years. Researchers are now investigating the specific biological mechanisms responsible for these outcomes.`,
                source: 'National Institutes of Health',
                sourceUrl: 'https://nih.gov',
                publicationDate: '1 week ago',
                relevanceScore: 0.87,
                category: 'Academic'
            },
            {
                title: `Practical Guide to Starting Your ${topic} Journey`,
                summary: `For those new to ${topic}, the abundance of information and options can be overwhelming. This practical guide breaks down the essential steps for beginners, drawing on advice from certified practitioners and researchers. The guide emphasizes sustainable practices over quick fixes and provides a realistic timeline for experiencing results.`,
                source: 'Healthline',
                sourceUrl: 'https://healthline.com',
                publicationDate: '5 days ago',
                relevanceScore: 0.85,
                category: 'Industry Blogs'
            },
            {
                title: `${topic} Industry Trends and Market Growth`,
                summary: `The global ${topic} market is projected to reach $4.5 trillion by 2027, driven by increasing consumer awareness and technological innovation. Digital health platforms incorporating ${topic} principles have seen user growth of 200% over the past two years. Investors are taking notice, with record funding flowing into the sector.`,
                source: 'Global Wellness Institute',
                sourceUrl: 'https://globalwellnessinstitute.org',
                publicationDate: '3 days ago',
                relevanceScore: 0.83,
                category: 'Industry Blogs'
            },
            {
                title: `Expert Perspectives on ${topic}: A Panel Discussion`,
                summary: `Leading experts from medicine, nutrition, psychology, and fitness share their perspectives on ${topic} and its role in comprehensive wellness programs. While approaches differ, consensus emerges around several core principles that should guide anyone interested in exploring ${topic}. The discussion also addresses common barriers to adoption.`,
                source: 'Well+Good',
                sourceUrl: 'https://wellandgood.com',
                publicationDate: '6 days ago',
                relevanceScore: 0.81,
                category: 'Industry Blogs'
            }
        ],
        'Personal Development': [
            {
                title: `Mastering ${topic}: A Science-Based Framework`,
                summary: `Cognitive scientists and performance coaches have developed a comprehensive framework for mastering ${topic} based on decades of research. The framework identifies five key stages of development and provides practical exercises for progressing through each stage. Studies show practitioners using this framework achieve goals 60% faster than those using traditional approaches.`,
                source: 'Psychology Today',
                sourceUrl: 'https://psychologytoday.com',
                publicationDate: '2 days ago',
                relevanceScore: 0.97,
                category: 'Academic'
            },
            {
                title: `How Successful People Approach ${topic}`,
                summary: `Analysis of habits and routines of 500 high achievers reveals consistent patterns in how they approach ${topic}. Morning routines, deliberate practice, and strategic recovery emerge as universal themes. Neuroscience research supports the effectiveness of these approaches, explaining the biological mechanisms behind peak performance.`,
                source: 'Success Magazine',
                sourceUrl: 'https://success.com',
                publicationDate: '1 week ago',
                relevanceScore: 0.94,
                category: 'Industry Blogs'
            },
            {
                title: `${topic} and Emotional Intelligence: The Connection`,
                summary: `New research from Yale's Center for Emotional Intelligence demonstrates a strong connection between ${topic} and emotional intelligence development. Individuals who actively work on ${topic} show measurable improvements in self-awareness, empathy, and relationship management. These findings have significant implications for both personal and professional development.`,
                source: 'Harvard Business Review',
                sourceUrl: 'https://hbr.org',
                publicationDate: '4 days ago',
                relevanceScore: 0.91,
                category: 'Academic'
            },
            {
                title: `Overcoming Obstacles in Your ${topic} Journey`,
                summary: `Research on behavior change identifies the most common obstacles people face when working on ${topic} and evidence-based strategies for overcoming them. The study found that 78% of people who fail at ${topic} goals do so due to a small number of predictable and preventable mistakes. Implementation intentions and accountability systems emerge as the most effective interventions.`,
                source: 'Mindful Magazine',
                sourceUrl: 'https://mindful.org',
                publicationDate: '3 days ago',
                relevanceScore: 0.88,
                category: 'Industry Blogs'
            },
            {
                title: `${topic} Habits That Transform Your Daily Life`,
                summary: `Habit formation researchers have identified specific ${topic} practices that have an outsized positive impact on daily life quality. These keystone habits create cascading positive effects across multiple life domains including career, relationships, and health. The research provides specific implementation strategies tailored to different personality types.`,
                source: 'James Clear Newsletter',
                sourceUrl: 'https://jamesclear.com',
                publicationDate: '5 days ago',
                relevanceScore: 0.86,
                category: 'Industry Blogs'
            },
            {
                title: `The Role of Community in ${topic} Success`,
                summary: `Social psychology research confirms that community and accountability partnerships significantly improve outcomes in ${topic} development. People who pursue ${topic} goals with social support are 65% more likely to achieve them. Online communities, mastermind groups, and coaching relationships all show positive effects, though with different mechanisms.`,
                source: 'Greater Good Science Center',
                sourceUrl: 'https://greatergood.berkeley.edu',
                publicationDate: '1 week ago',
                relevanceScore: 0.84,
                category: 'Academic'
            },
            {
                title: `Measuring Progress in ${topic}: Metrics That Matter`,
                summary: `Performance coaches and researchers share frameworks for measuring progress in ${topic} that go beyond surface-level metrics. The most effective measurement systems combine quantitative tracking with qualitative reflection, creating a comprehensive picture of development. Regular assessment using these frameworks has been shown to improve motivation and course-correction.`,
                source: 'Tony Robbins Blog',
                sourceUrl: 'https://tonyrobbins.com',
                publicationDate: '4 days ago',
                relevanceScore: 0.82,
                category: 'Industry Blogs'
            },
            {
                title: `${topic} for Career Advancement: Strategies That Work`,
                summary: `Career development specialists have documented how ${topic} skills directly translate to professional advancement. Surveys of HR professionals show that candidates demonstrating strong ${topic} competencies are hired at higher rates and promoted faster. Specific strategies for showcasing these skills in professional contexts are provided.`,
                source: 'LinkedIn Learning',
                sourceUrl: 'https://linkedin.com/learning',
                publicationDate: '6 days ago',
                relevanceScore: 0.80,
                category: 'Industry Blogs'
            }
        ]
    };

    // Default template for niches not specifically defined
    const defaultTemplates = [
        {
            title: `Understanding ${topic} in the ${niche} Space`,
            summary: `Industry experts have identified ${topic} as a critical area of focus within the ${niche} sector. Recent surveys show growing interest and investment, with practitioners reporting significant positive outcomes. The trend is expected to continue accelerating over the next several years as awareness increases.`,
            source: 'Industry Weekly',
            sourceUrl: 'https://industryweekly.com',
            publicationDate: '2 days ago',
            relevanceScore: 0.95,
            category: 'News'
        },
        {
            title: `${topic}: Trends and Insights for ${niche} Professionals`,
            summary: `A comprehensive analysis of ${topic} reveals important trends that ${niche} professionals need to understand. Research conducted across multiple markets shows consistent patterns that can inform both strategy and practice. Early adopters are already seeing competitive advantages from applying these insights.`,
            source: 'Professional Insights Journal',
            sourceUrl: 'https://professionalinsights.com',
            publicationDate: '1 week ago',
            relevanceScore: 0.92,
            category: 'Academic'
        },
        {
            title: `How ${topic} is Changing the ${niche} Landscape`,
            summary: `The ${niche} industry is undergoing significant transformation driven by developments in ${topic}. Traditional approaches are being challenged by new methodologies that promise better outcomes and greater efficiency. Industry leaders who have embraced these changes share their experiences and recommendations.`,
            source: 'Sector Analysis Report',
            sourceUrl: 'https://sectoranalysis.com',
            publicationDate: '3 days ago',
            relevanceScore: 0.90,
            category: 'Industry Blogs'
        },
        {
            title: `Expert Roundtable: The Future of ${topic} in ${niche}`,
            summary: `Ten leading voices in the ${niche} space share their predictions for how ${topic} will evolve over the next decade. While perspectives vary on timeline and magnitude, consensus exists around several key developments that practitioners should prepare for. Actionable recommendations are provided for both individuals and organizations.`,
            source: 'Thought Leaders Forum',
            sourceUrl: 'https://thoughtleaders.com',
            publicationDate: '4 days ago',
            relevanceScore: 0.88,
            category: 'Industry Blogs'
        },
        {
            title: `${topic}: Common Challenges and Proven Solutions`,
            summary: `Practitioners in the ${niche} field share the most common challenges they encounter with ${topic} and the solutions that have worked for them. The compilation reveals patterns that suggest systemic issues requiring both individual and organizational responses. A practical troubleshooting framework is provided.`,
            source: 'Practitioner Quarterly',
            sourceUrl: 'https://practitionerquarterly.com',
            publicationDate: '5 days ago',
            relevanceScore: 0.86,
            category: 'Industry Blogs'
        },
        {
            title: `Data-Driven Insights on ${topic} Performance`,
            summary: `Analysis of data from over 1,000 ${niche} organizations reveals key performance indicators for ${topic} initiatives. High-performing organizations share several common characteristics that distinguish them from average performers. The research provides a benchmarking framework that organizations can use to assess and improve their own performance.`,
            source: 'Research Analytics Group',
            sourceUrl: 'https://researchanalytics.com',
            publicationDate: '1 week ago',
            relevanceScore: 0.84,
            category: 'Academic'
        },
        {
            title: `${topic} Best Practices: Lessons from Industry Leaders`,
            summary: `Case studies from leading ${niche} organizations document best practices in ${topic} that have delivered measurable results. The studies reveal both universal principles and context-specific adaptations that organizations should consider when developing their own approaches. Implementation guidance is provided for organizations at different stages of maturity.`,
            source: 'Best Practices Institute',
            sourceUrl: 'https://bestpractices.com',
            publicationDate: '6 days ago',
            relevanceScore: 0.82,
            category: 'Academic'
        },
        {
            title: `The Economic Impact of ${topic} on the ${niche} Industry`,
            summary: `Economic analysis reveals the significant financial implications of ${topic} for the ${niche} industry. Organizations that have invested in ${topic} report average ROI of 340% over three years. The analysis also identifies sectors within ${niche} that stand to benefit most from strategic ${topic} investment.`,
            source: 'Economic Research Institute',
            sourceUrl: 'https://econresearch.com',
            publicationDate: '3 days ago',
            relevanceScore: 0.80,
            category: 'Academic'
        }
    ];

    // Return niche-specific or default templates
    const templates = researchTemplates[niche] || defaultTemplates;
    return templates;
};

// @desc    Generate research for episode
// @route   POST /api/research/generate/:episodeId
const generateResearch = async (req, res) => {
    try {
        const episode = await Episode.findById(req.params.episodeId);

        if (!episode) {
            return res.status(404).json({
                success: false,
                message: 'Episode not found'
            });
        }

        if (episode.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Update episode research status
        episode.researchStatus = 'processing';
        await episode.save();

        // Delete existing research for fresh generation
        await Research.deleteMany({ episode: episode._id });

        // Generate research data
        const researchData = generateResearchData(
            episode.podcastNiche,
            episode.episodeTopic
        );

        // Determine how many results based on subscription
        const resultLimit = req.user.subscription === 'premium' ? 8 : 5;
        const limitedData = researchData.slice(0, resultLimit);

        // Save research to database
        const researchDocs = limitedData.map(item => ({
            ...item,
            episode: episode._id,
            user: req.user.id,
            niche: episode.podcastNiche,
            topic: episode.episodeTopic
        }));

        const savedResearch = await Research.insertMany(researchDocs);

        // Update episode status
        episode.researchStatus = 'complete';
        episode.status = 'research';
        await episode.save();

        res.status(200).json({
            success: true,
            message: 'Research generated successfully',
            count: savedResearch.length,
            research: savedResearch
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get research for episode
// @route   GET /api/research/:episodeId
const getResearch = async (req, res) => {
    try {
        const episode = await Episode.findById(req.params.episodeId);

        if (!episode) {
            return res.status(404).json({
                success: false,
                message: 'Episode not found'
            });
        }

        if (episode.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const { filter, category } = req.query;

        let query = {
            episode: req.params.episodeId,
            isRejected: false
        };

        // Filter by category
        if (category && category !== 'all') {
            query.category = category;
        }

        let research = await Research.find(query)
            .sort({ relevanceScore: -1 });

        // Filter by recency
        if (filter === 'recent') {
            research = research.filter(r =>
                r.publicationDate.includes('day') ||
                r.publicationDate.includes('hour')
            );
        }

        res.status(200).json({
            success: true,
            count: research.length,
            research
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Bookmark a research topic
// @route   PUT /api/research/:researchId/bookmark
const bookmarkTopic = async (req, res) => {
    try {
        const research = await Research.findById(req.params.researchId);

        if (!research) {
            return res.status(404).json({
                success: false,
                message: 'Research topic not found'
            });
        }

        if (research.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Check max bookmarks (10 per episode)
        if (!research.isBookmarked) {
            const bookmarkCount = await Research.countDocuments({
                episode: research.episode,
                isBookmarked: true
            });

            if (bookmarkCount >= 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum 10 bookmarks allowed per episode. Remove a bookmark to add a new one.'
                });
            }
        }

        // Toggle bookmark
        research.isBookmarked = !research.isBookmarked;
        await research.save();

        // Update episode bookmarked topics
        const episode = await Episode.findById(research.episode);
        if (research.isBookmarked) {
            episode.bookmarkedTopics.addToSet(research._id);
        } else {
            episode.bookmarkedTopics.pull(research._id);
        }
        await episode.save();

        res.status(200).json({
            success: true,
            message: research.isBookmarked
                ? 'Topic bookmarked successfully'
                : 'Bookmark removed successfully',
            isBookmarked: research.isBookmarked
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Reject a research topic
// @route   PUT /api/research/:researchId/reject
const rejectTopic = async (req, res) => {
    try {
        const research = await Research.findById(req.params.researchId);

        if (!research) {
            return res.status(404).json({
                success: false,
                message: 'Research topic not found'
            });
        }

        if (research.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        research.isRejected = true;
        research.isBookmarked = false;
        await research.save();

        // Remove from episode bookmarks if it was bookmarked
        const episode = await Episode.findById(research.episode);
        episode.bookmarkedTopics.pull(research._id);
        await episode.save();

        res.status(200).json({
            success: true,
            message: 'Topic rejected successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get bookmarked topics for episode
// @route   GET /api/research/:episodeId/bookmarks
const getBookmarkedTopics = async (req, res) => {
    try {
        const episode = await Episode.findById(req.params.episodeId);

        if (!episode) {
            return res.status(404).json({
                success: false,
                message: 'Episode not found'
            });
        }

        if (episode.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const bookmarkedTopics = await Research.find({
            episode: req.params.episodeId,
            isBookmarked: true
        });

        res.status(200).json({
            success: true,
            count: bookmarkedTopics.length,
            bookmarkedTopics
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Refresh research for episode
// @route   POST /api/research/refresh/:episodeId
const refreshResearch = async (req, res) => {
    try {
        const episode = await Episode.findById(req.params.episodeId);

        if (!episode) {
            return res.status(404).json({
                success: false,
                message: 'Episode not found'
            });
        }

        if (episode.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Delete non-bookmarked research
        await Research.deleteMany({
            episode: episode._id,
            isBookmarked: false
        });

        // Generate fresh research
        const researchData = generateResearchData(
            episode.podcastNiche,
            episode.episodeTopic
        );

        const resultLimit = req.user.subscription === 'premium' ? 8 : 5;

        // Filter out already bookmarked titles
        const bookmarked = await Research.find({
            episode: episode._id,
            isBookmarked: true
        });
        const bookmarkedTitles = bookmarked.map(b => b.title);

        const freshData = researchData
            .filter(r => !bookmarkedTitles.includes(r.title))
            .slice(0, resultLimit - bookmarked.length);

        const newDocs = freshData.map(item => ({
            ...item,
            episode: episode._id,
            user: req.user.id,
            niche: episode.podcastNiche,
            topic: episode.episodeTopic
        }));

        await Research.insertMany(newDocs);

        const allResearch = await Research.find({
            episode: episode._id,
            isRejected: false
        }).sort({ relevanceScore: -1 });

        res.status(200).json({
            success: true,
            message: 'Research refreshed successfully',
            count: allResearch.length,
            research: allResearch
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    generateResearch,
    getResearch,
    bookmarkTopic,
    rejectTopic,
    getBookmarkedTopics,
    refreshResearch
};