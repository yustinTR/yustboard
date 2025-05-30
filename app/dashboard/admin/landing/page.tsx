'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiSave, FiPlus, FiTrash2, FiEdit, FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MediaSelector from '@/components/dashboard/MediaSelector';

interface Hero {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
  active: boolean;
}

interface About {
  id?: string;
  title: string;
  content: string;
  image?: string;
  skills: { name: string; percentage: number }[];
  active: boolean;
}

interface Project {
  id?: string;
  title: string;
  description: string;
  image: string;
  link?: string;
  github?: string;
  tags: string[];
  featured: boolean;
  order: number;
  active: boolean;
}

interface Contact {
  id?: string;
  email: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  active: boolean;
}

export default function LandingPageAdmin() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Content states
  const [hero, setHero] = useState<Hero>({
    title: '',
    subtitle: '',
    description: '',
    ctaText: 'Get Started',
    ctaLink: '/dashboard',
    active: true
  });
  
  const [about, setAbout] = useState<About>({
    title: 'About Me',
    content: '',
    skills: [],
    active: true
  });
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [contact, setContact] = useState<Contact>({
    email: '',
    active: true
  });
  
  const [newSkill, setNewSkill] = useState({ name: '', percentage: 50 });
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<Project>({
    title: '',
    description: '',
    image: '',
    tags: [],
    featured: false,
    order: 0,
    active: true
  });
  const [newTag, setNewTag] = useState('');

  // Fetch existing content
  useEffect(() => {
    if (status === 'authenticated') {
      fetchContent();
    }
  }, [status]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const [heroRes, aboutRes, projectsRes, contactRes] = await Promise.all([
        fetch('/api/landing/hero'),
        fetch('/api/landing/about'),
        fetch('/api/landing/projects'),
        fetch('/api/landing/contact')
      ]);
      
      const heroData = await heroRes.json();
      const aboutData = await aboutRes.json();
      const projectsData = await projectsRes.json();
      const contactData = await contactRes.json();
      
      if (heroData) setHero(heroData);
      if (aboutData) setAbout(aboutData);
      if (projectsData) setProjects(projectsData);
      if (contactData) setContact(contactData);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save functions
  const saveHero = async () => {
    setSaving(true);
    try {
      const method = hero.id ? 'PUT' : 'POST';
      const res = await fetch('/api/landing/hero', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hero)
      });
      const data = await res.json();
      setHero(data);
      alert('Hero section saved successfully!');
    } catch (error) {
      console.error('Error saving hero:', error);
      alert('Failed to save hero section');
    } finally {
      setSaving(false);
    }
  };

  const saveAbout = async () => {
    setSaving(true);
    try {
      const method = about.id ? 'PUT' : 'POST';
      const res = await fetch('/api/landing/about', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(about)
      });
      const data = await res.json();
      setAbout(data);
      alert('About section saved successfully!');
    } catch (error) {
      console.error('Error saving about:', error);
      alert('Failed to save about section');
    } finally {
      setSaving(false);
    }
  };

  const saveProject = async (project: Project) => {
    setSaving(true);
    try {
      const method = project.id ? 'PUT' : 'POST';
      const res = await fetch('/api/landing/projects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      const data = await res.json();
      
      if (project.id) {
        setProjects(projects.map(p => p.id === data.id ? data : p));
      } else {
        setProjects([...projects, data]);
      }
      
      setEditingProject(null);
      setNewProject({
        title: '',
        description: '',
        image: '',
        tags: [],
        featured: false,
        order: 0,
        active: true
      });
      alert('Project saved successfully!');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await fetch(`/api/landing/projects?id=${id}`, {
        method: 'DELETE'
      });
      setProjects(projects.filter(p => p.id !== id));
      alert('Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const saveContact = async () => {
    setSaving(true);
    try {
      const method = contact.id ? 'PUT' : 'POST';
      const res = await fetch('/api/landing/contact', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
      });
      const data = await res.json();
      setContact(data);
      alert('Contact info saved successfully!');
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Failed to save contact info');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (session?.user?.role !== 'ADMIN') {
    return <div className="p-6">Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Landing Page Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Customize your landing page content and settings</p>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <TabsTrigger value="hero" className="text-sm font-medium">🎯 Hero</TabsTrigger>
          <TabsTrigger value="about" className="text-sm font-medium">👤 About</TabsTrigger>
          <TabsTrigger value="projects" className="text-sm font-medium">💼 Projects</TabsTrigger>
          <TabsTrigger value="contact" className="text-sm font-medium">📧 Contact</TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                🎯 Hero Section
                <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                  Main Banner
                </span>
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">The first thing visitors see on your landing page</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Title</Label>
                  <input
                    type="text"
                    value={hero.title}
                    onChange={(e) => setHero({ ...hero, title: e.target.value })}
                    placeholder="Enter your main headline"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Subtitle</Label>
                  <input
                    type="text"
                    value={hero.subtitle}
                    onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                    placeholder="Enter your subtitle"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Description</Label>
                <textarea
                  value={hero.description}
                  onChange={(e) => setHero({ ...hero, description: e.target.value })}
                  placeholder="Describe what your landing page is about..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  rows={4}
                />
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">Call-to-Action Button</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Button Text</Label>
                    <input
                      type="text"
                      value={hero.ctaText}
                      onChange={(e) => setHero({ ...hero, ctaText: e.target.value })}
                      placeholder="e.g., Get Started"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Button Link</Label>
                    <input
                      type="text"
                      value={hero.ctaLink}
                      onChange={(e) => setHero({ ...hero, ctaLink: e.target.value })}
                      placeholder="e.g., /dashboard"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
              <MediaSelector
                value={hero.backgroundImage || ''}
                onChange={(url) => setHero({ ...hero, backgroundImage: url })}
                label="Background Image (optional)"
                placeholder="Select Background Image"
              />
              <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  onClick={saveHero} 
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
                >
                  <FiSave className="mr-2" />
                  {saving ? 'Saving...' : 'Save Hero Section'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Section */}
        <TabsContent value="about">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                👤 About Section
                <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                  Personal Info
                </span>
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">Tell your story and showcase your skills</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div>
                <Label>Title</Label>
                <input
                  type="text"
                  value={about.title}
                  onChange={(e) => setAbout({ ...about, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div>
                <Label>Content</Label>
                <textarea
                  value={about.content}
                  onChange={(e) => setAbout({ ...about, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  rows={6}
                />
              </div>
              <MediaSelector
                value={about.image || ''}
                onChange={(url) => setAbout({ ...about, image: url })}
                label="Profile Image (optional)"
                placeholder="Select Profile Image"
              />
              
              {/* Skills */}
              <div>
                <Label className="mb-2 block">Skills</Label>
                <div className="space-y-2">
                  {about.skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => {
                          const newSkills = [...about.skills];
                          newSkills[index].name = e.target.value;
                          setAbout({ ...about, skills: newSkills });
                        }}
                        className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                      />
                      <input
                        type="number"
                        value={skill.percentage}
                        onChange={(e) => {
                          const newSkills = [...about.skills];
                          newSkills[index].percentage = parseInt(e.target.value);
                          setAbout({ ...about, skills: newSkills });
                        }}
                        className="w-20 px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                        min="0"
                        max="100"
                      />
                      <span>%</span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const newSkills = about.skills.filter((_, i) => i !== index);
                          setAbout({ ...about, skills: newSkills });
                        }}
                      >
                        <FiTrash2 />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    placeholder="Skill name"
                    className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  />
                  <input
                    type="number"
                    value={newSkill.percentage}
                    onChange={(e) => setNewSkill({ ...newSkill, percentage: parseInt(e.target.value) })}
                    className="w-20 px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                    min="0"
                    max="100"
                  />
                  <span>%</span>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (newSkill.name) {
                        setAbout({ ...about, skills: [...about.skills, newSkill] });
                        setNewSkill({ name: '', percentage: 50 });
                      }
                    }}
                  >
                    <FiPlus />
                  </Button>
                </div>
              </div>
              
              <Button onClick={saveAbout} disabled={saving}>
                <FiSave className="mr-2" />
                Save About Section
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Section */}
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Project Form */}
              <div className="border rounded-lg p-4 space-y-4 dark:border-gray-700">
                <h3 className="font-semibold">
                  {editingProject ? 'Edit Project' : 'Add New Project'}
                </h3>
                <div>
                  <Label>Title</Label>
                  <input
                    type="text"
                    value={editingProject ? editingProject.title : newProject.title}
                    onChange={(e) => {
                      if (editingProject) {
                        setEditingProject({ ...editingProject, title: e.target.value });
                      } else {
                        setNewProject({ ...newProject, title: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea
                    value={editingProject ? editingProject.description : newProject.description}
                    onChange={(e) => {
                      if (editingProject) {
                        setEditingProject({ ...editingProject, description: e.target.value });
                      } else {
                        setNewProject({ ...newProject, description: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                    rows={3}
                  />
                </div>
                <MediaSelector
                  value={editingProject ? editingProject.image : newProject.image}
                  onChange={(url) => {
                    if (editingProject) {
                      setEditingProject({ ...editingProject, image: url });
                    } else {
                      setNewProject({ ...newProject, image: url });
                    }
                  }}
                  label="Project Image"
                  placeholder="Select Project Image"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Project Link (optional)</Label>
                    <input
                      type="text"
                      value={editingProject ? editingProject.link || '' : newProject.link || ''}
                      onChange={(e) => {
                        if (editingProject) {
                          setEditingProject({ ...editingProject, link: e.target.value });
                        } else {
                          setNewProject({ ...newProject, link: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                    />
                  </div>
                  <div>
                    <Label>GitHub Link (optional)</Label>
                    <input
                      type="text"
                      value={editingProject ? editingProject.github || '' : newProject.github || ''}
                      onChange={(e) => {
                        if (editingProject) {
                          setEditingProject({ ...editingProject, github: e.target.value });
                        } else {
                          setNewProject({ ...newProject, github: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                    />
                  </div>
                </div>
                
                {/* Tags */}
                <div>
                  <Label>Technologies</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(editingProject ? editingProject.tags : newProject.tags).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm flex items-center gap-1"
                      >
                        {tag}
                        <button
                          onClick={() => {
                            const currentProject = editingProject || newProject;
                            const newTags = currentProject.tags.filter((_, i) => i !== index);
                            if (editingProject) {
                              setEditingProject({ ...editingProject, tags: newTags });
                            } else {
                              setNewProject({ ...newProject, tags: newTags });
                            }
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newTag) {
                          e.preventDefault();
                          const currentProject = editingProject || newProject;
                          if (editingProject) {
                            setEditingProject({ ...editingProject, tags: [...currentProject.tags, newTag] });
                          } else {
                            setNewProject({ ...newProject, tags: [...currentProject.tags, newTag] });
                          }
                          setNewTag('');
                        }
                      }}
                      placeholder="Add technology"
                      className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (newTag) {
                          const currentProject = editingProject || newProject;
                          if (editingProject) {
                            setEditingProject({ ...editingProject, tags: [...currentProject.tags, newTag] });
                          } else {
                            setNewProject({ ...newProject, tags: [...currentProject.tags, newTag] });
                          }
                          setNewTag('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingProject ? editingProject.featured : newProject.featured}
                      onCheckedChange={(checked) => {
                        if (editingProject) {
                          setEditingProject({ ...editingProject, featured: checked });
                        } else {
                          setNewProject({ ...newProject, featured: checked });
                        }
                      }}
                    />
                    <Label>Featured</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label>Order</Label>
                    <input
                      type="number"
                      value={editingProject ? editingProject.order : newProject.order}
                      onChange={(e) => {
                        const order = parseInt(e.target.value);
                        if (editingProject) {
                          setEditingProject({ ...editingProject, order });
                        } else {
                          setNewProject({ ...newProject, order });
                        }
                      }}
                      className="w-20 px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => saveProject(editingProject || newProject)}
                    disabled={saving}
                  >
                    <FiSave className="mr-2" />
                    {editingProject ? 'Update' : 'Add'} Project
                  </Button>
                  {editingProject && (
                    <Button
                      variant="outline"
                      onClick={() => setEditingProject(null)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              {/* Projects List */}
              <div className="space-y-2">
                <h3 className="font-semibold">Existing Projects</h3>
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 border rounded-md dark:border-gray-700"
                  >
                    <div>
                      <h4 className="font-medium">
                        {project.title}
                        {project.featured && (
                          <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                            Featured
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Order: {project.order}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingProject(project)}
                      >
                        <FiEdit />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => project.id && deleteProject(project.id)}
                      >
                        <FiTrash2 />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Section */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email</Label>
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div>
                <Label>Phone (optional)</Label>
                <input
                  type="text"
                  value={contact.phone || ''}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div>
                <Label>Address (optional)</Label>
                <input
                  type="text"
                  value={contact.address || ''}
                  onChange={(e) => setContact({ ...contact, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Social Links</h3>
                <div className="flex items-center gap-2">
                  <FiLinkedin className="text-gray-500" />
                  <input
                    type="text"
                    value={contact.linkedin || ''}
                    onChange={(e) => setContact({ ...contact, linkedin: e.target.value })}
                    placeholder="LinkedIn URL"
                    className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <FiGithub className="text-gray-500" />
                  <input
                    type="text"
                    value={contact.github || ''}
                    onChange={(e) => setContact({ ...contact, github: e.target.value })}
                    placeholder="GitHub URL"
                    className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <FiTwitter className="text-gray-500" />
                  <input
                    type="text"
                    value={contact.twitter || ''}
                    onChange={(e) => setContact({ ...contact, twitter: e.target.value })}
                    placeholder="Twitter URL"
                    className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </div>
              
              <Button onClick={saveContact} disabled={saving}>
                <FiSave className="mr-2" />
                Save Contact Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}